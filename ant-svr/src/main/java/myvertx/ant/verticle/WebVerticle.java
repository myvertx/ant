package myvertx.ant.verticle;

import io.vertx.core.MultiMap;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import lombok.extern.slf4j.Slf4j;
import myvertx.ant.ra.PathRa;
import myvertx.ant.ra.UploadRa;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FilenameUtils;
import rebue.wheel.api.dic.ResultDic;
import rebue.wheel.vertx.ro.Vro;
import rebue.wheel.vertx.verticle.AbstractWebVerticle;

import java.io.DataInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
public class WebVerticle extends AbstractWebVerticle {
    @Inject
    @Named("tempPath")
    private String tempPath;
    @Inject
    @Named("rootPath")
    private String rootPath;
    @Inject
    @Named("uploadFileSizeLimit")
    private Long uploadFileSizeLimit;

    @Override
    protected void configRouter(final Router router) {
        // 查询指定路径的文件列表
        router.get("/ant/file/list")
                .handler(ctx -> {
                    final HttpServerResponse response = ctx.response();
                    response.putHeader("Content-Type", "application/json");

                    List<String> pathParams = ctx.queryParam("path");
                    if (pathParams.isEmpty()) {
                        response.end(Json.encode(Vro.illegalArgument("path参数不能为空")));
                        return;
                    }
                    if (pathParams.size() > 1) {
                        response.end(Json.encode(Vro.illegalArgument("path参数不能有多个")));
                        return;
                    }
                    String pathParam = pathParams.get(0);
                    Path dirFullPath = Path.of(rootPath, pathParam);
                    log.debug("指定目录的全路径为: {}", dirFullPath);

                    try (Stream<Path> stream = Files.list(dirFullPath)) {
                        List<PathRa> paths = stream
                                .map(path -> PathRa.builder()
                                        .isDir(Files.isDirectory(path))
                                        .name(path.getFileName().toString())
                                        .path(path.toString().replaceFirst("^" + rootPath, ""))
                                        .build()
                                )
                                .collect(Collectors.toList());
                        response.end(Json.encode(Vro.success("列出指定目录下的文件成功", paths)));
                    } catch (IOException e) {
                        response.end(Json.encode(Vro.warn("读取路径失败", e.getMessage())));
                    }
                });

        // 覆盖文件
        router.post("/ant/file/overwrite")
                .handler(BodyHandler.create())
                .handler(ctx -> {
                    final HttpServerResponse response = ctx.response();
                    response.putHeader("Content-Type", "application/json");

                    JsonObject body = ctx.body().asJsonObject();
                    Boolean isOverWrite = body.getBoolean("isOverWrite");
                    Path tempFilePath = Path.of(body.getString("tempFilePath"));
                    Path dstFilePath = Path.of(body.getString("dstFilePath"));
                    String dstPathStr = dstFilePath.toString();
                    if (isOverWrite) {
                        try {
                            Files.delete(dstFilePath);
                        } catch (IOException e) {
                            log.warn("删除目的文件失败");
                        }
                    } else {
                        String baseName = FilenameUtils.removeExtension(dstPathStr);
                        String extension = FilenameUtils.getExtension(dstPathStr);
                        int i = 0;
                        while (Files.exists(dstFilePath)) {
                            i++;
                            dstFilePath = Path.of(baseName + "(" + i + ")." + extension);
                        }
                    }

                    if (!move(response, tempFilePath, dstFilePath)) return;

                    response.end(Json.encode(Vro.success("文件" + (isOverWrite ? "覆盖" : "保存") + "成功")));
                });


        // 上传文件
        BodyHandler bodyHandler = BodyHandler.create()
                .setUploadsDirectory(tempPath);
        if (uploadFileSizeLimit != 0) {
            bodyHandler.setBodyLimit(uploadFileSizeLimit);
        }
        router.post("/ant/file/upload")
                .handler(bodyHandler)
                .handler(ctx -> {
                    final HttpServerResponse response = ctx.response();
                    response.putHeader("Content-Type", "application/json");

                    MultiMap formAttributes = ctx.request().formAttributes();
                    log.debug("formAttributes: {}", formAttributes);
                    String sDstDir = formAttributes.get("dstDir");
                    String hash = formAttributes.get("hash");
                    List<FileUpload> fileUploads = ctx.fileUploads();
                    if (fileUploads.isEmpty()) {
                        response.end(Json.encode(Vro.fail("上传内容为空，可能是上传未完成就刷新了页面")));
                        return;
                    }

                    FileUpload fileUpload = fileUploads.get(0);
                    log.debug("""
                                    fileUpload:
                                    - name: {}
                                    - uploadedFileName: {}
                                    - fileName: {}
                                    - size: {}
                                    - contentType: {}
                                    - contentTransferEncoding: {}
                                    - charSet: {}
                                    """,
                            fileUpload.name(),
                            fileUpload.uploadedFileName(),
                            fileUpload.fileName(),
                            fileUpload.size(),
                            fileUpload.contentType(),
                            fileUpload.contentTransferEncoding(),
                            fileUpload.charSet()
                    );

                    // 临时文件路径
                    Path tempFilePath = Path.of(fileUpload.uploadedFileName());
                    // 检测hash是否正确
                    try (FileInputStream fileInputStream = new FileInputStream(tempFilePath.toString());
                         DataInputStream dataInputStream = new DataInputStream(fileInputStream)) {
                        String correctHash = DigestUtils.sha256Hex(dataInputStream);
                        log.debug("正确的hash是: {}", correctHash);
                        if (!correctHash.equalsIgnoreCase(hash)) {
                            response.end(Json.encode(Vro.fail("文件校验不正确，请重新传输: " + fileUpload.fileName())));
                            return;
                        }
                    } catch (IOException e) {
                        response.end(Json.encode(Vro.fail("读取临时文件出错: " + fileUpload.fileName())));
                        return;
                    }

                    // 目的地目录
                    Path dstDir = Path.of(rootPath, sDstDir);
                    // 目的地文件路径
                    Path dstFilePath = Path.of(dstDir.toString(), fileUpload.fileName());

                    // 判断目的地文件是否存在
                    if (Files.exists(dstFilePath)) {
                        String msg = "文件已经存在";
                        log.info("{}: {}", msg, dstFilePath);
                        response.end(Json.encode(Vro.builder()
                                .result(ResultDic.WARN)
                                .code("FILE_EXIST")
                                .msg(msg)
                                .extra(JsonObject.of(
                                        "tempFilePath", tempFilePath.toString(),
                                        "dstFilePath", dstFilePath.toString()))
                                .build()));
                        return;
                    }

                    if (!move(response, tempFilePath, dstFilePath)) return;

                    response.end(Json.encode(Vro.success("文件上传成功", UploadRa.builder()
                            .fileDir(sDstDir)
                            .fileName(dstFilePath.getFileName().toString())
                            .fileFullPath(dstFilePath.toString())
                            .build())));
                });
    }

    private static boolean move(HttpServerResponse response, Path tempFilePath, Path dstFilePath) {
        Path dstDir;
        // 目的地目录
        dstDir = dstFilePath.getParent();
        // 如果目录不存在则创建
        if (Files.notExists(dstDir)) {
            try {
                Files.createDirectories(dstDir);
            } catch (IOException e) {
                String msg = "文件上传后创建目录出错";
                log.error(msg, e);
                try {
                    Files.delete(tempFilePath);
                } catch (IOException ex) {
                    log.error("删除上传的临时文件出错", e);
                }
                response.end(Json.encode(Vro.fail(msg, e.getMessage())));
                return false;
            }
        }

        // 临时文件移动成正式文件
        log.debug("remove: {} -> {}", tempFilePath, dstFilePath);
        try {
            Files.move(tempFilePath,
                    dstFilePath,
                    StandardCopyOption.ATOMIC_MOVE);
            return true;
        } catch (NoSuchFileException e) {
            String msg = "上传的临时文件已被删除";
            log.error(msg, e);
            response.end(Json.encode(Vro.builder()
                    .result(ResultDic.FAIL)
                    .msg(msg)
                    .code("TEMP_FILE_REMOVED")
                    .build()));
            return false;
        } catch (IOException e) {
            String msg = "文件上传后移动出错";
            log.error(msg, e);
            response.end(Json.encode(Vro.fail(msg, e.getMessage())));
            return false;
        }
    }


}
