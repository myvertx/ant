package myvertx.ant.verticle;

import io.vertx.core.MultiMap;
import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.Json;
import io.vertx.ext.web.FileUpload;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import lombok.extern.slf4j.Slf4j;
import myvertx.ant.ra.PathRa;
import org.apache.commons.io.FilenameUtils;
import rebue.wheel.vertx.ro.Vro;
import rebue.wheel.vertx.verticle.AbstractWebVerticle;

import javax.inject.Inject;
import javax.inject.Named;
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
                    List<FileUpload> fileUploads = ctx.fileUploads();
                    for (FileUpload fileUpload : fileUploads) {
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

                        Path   srcPath    = Path.of(fileUpload.uploadedFileName());
                        Path   dstPath    = Path.of(rootPath, fileDir, fileUpload.fileName());
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
                            response.end(Json.encode(Vro.fail("文件上传后移动出错", e.getMessage())));
                            return;
                        }
                    }
                    response.end(Json.encode(Vro.success("文件上传成功")));
                });
    }


}
