package myvertx.ant.verticle;

import io.vertx.core.MultiMap;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.Json;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import lombok.extern.slf4j.Slf4j;
import myvertx.ant.ra.PathRa;
import myvertx.ant.ra.UploadRa;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import rebue.wheel.vertx.ro.Vro;
import rebue.wheel.vertx.verticle.AbstractWebVerticle;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
public class WebVerticle extends AbstractWebVerticle {
    @Inject
    @Named("rootPath")
    private String rootPath;
    @Inject
    @Named("uploadFileSizeLimit")
    private Long   uploadFileSizeLimit;

    @Override
    protected void configRouter(final Router router) {
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
                    String pathParam   = pathParams.get(0);
                    Path   dirFullPath = Path.of(rootPath, pathParam);
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
        BodyHandler bodyHandler = BodyHandler.create()
                .setUploadsDirectory(rootPath);
//                .setMergeFormAttributes(true);
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
                    String           fileDir     = formAttributes.get("fileDir");
                    String           createDir   = formAttributes.get("createDir");
                    List<FileUpload> fileUploads = ctx.fileUploads();
                    FileUpload       fileUpload  = fileUploads.get(0);
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
                    Path srcPath = Path.of(fileUpload.uploadedFileName());
                    // 是否创建目录
                    if (StringUtils.isNotBlank(createDir)) {
                        fileDir += File.separator + createDir;
                    }
                    // 目的地目录
                    Path dstDir = Path.of(rootPath, fileDir);
                    // 如果目录不存在则创建
                    if (Files.notExists(dstDir)) {
                        try {
                            Files.createDirectories(dstDir);
                        } catch (IOException e) {
                            String msg = "文件上传后创建目录出错";
                            log.error(msg, e);
                            try {
                                Files.delete(srcPath);
                            } catch (IOException ex) {
                                log.error("删除上传的临时文件出错", e);
                            }
                            response.end(Json.encode(Vro.fail(msg, e.getMessage())));
                            return;
                        }
                    }
                    // 目的地
                    Path   dstPath    = Path.of(dstDir.toString(), fileUpload.fileName());
                    String dstPathStr = dstPath.toString();
                    String baseName   = FilenameUtils.removeExtension(dstPathStr);
                    String extension  = FilenameUtils.getExtension(dstPathStr);
                    int    i          = 0;
                    while (Files.exists(dstPath)) {
                        i++;
                        dstPath = Path.of(baseName + "(" + i + ")." + extension);
                    }
                    log.debug("remove: {} -> {}", srcPath, dstPath);
                    try {
                        Files.move(srcPath,
                                dstPath,
                                StandardCopyOption.ATOMIC_MOVE);
                    } catch (IOException e) {
                        String msg = "文件上传后移动出错";
                        log.error(msg, e);
                        try {
                            Files.delete(srcPath);
                        } catch (IOException ex) {
                            log.error("删除上传的临时文件出错", e);
                        }
                        response.end(Json.encode(Vro.fail(msg, e.getMessage())));
                        return;
                    }
                    response.end(Json.encode(Vro.success("文件上传成功", UploadRa.builder()
                            .fileDir(fileDir)
                            .fileName(dstPath.getFileName().toString())
                            .fileFullPath(dstPath.toString())
                            .build())));
                });
    }


}
