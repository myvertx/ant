package myvertx.ant.verticle;

import io.vertx.core.http.HttpServerResponse;
import io.vertx.core.json.Json;
import io.vertx.ext.web.Router;
import lombok.extern.slf4j.Slf4j;
import myvertx.ant.config.MainProperties;
import myvertx.ant.ra.PathRa;
import rebue.wheel.core.file.FileUtils;
import rebue.wheel.vertx.ro.Vro;
import rebue.wheel.vertx.verticle.AbstractWebVerticle;

import javax.inject.Inject;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
public class WebVerticle extends AbstractWebVerticle {
    @Inject
    private MainProperties mainProperties;

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
                    Path   rootPath    = Paths.get(FileUtils.getClassesPath(), mainProperties.getRoot());
                    Path   dirFullPath = Paths.get(rootPath.toString(), pathParam);
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
    }


}
