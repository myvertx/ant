package myvertx.ant.verticle;

import io.vertx.ext.web.Router;
import lombok.extern.slf4j.Slf4j;
import myvertx.ant.config.MainProperties;
import rebue.wheel.vertx.verticle.AbstractWebVerticle;

import javax.inject.Inject;

@Slf4j
public class WebVerticle extends AbstractWebVerticle {
    @Inject
    private MainProperties mainProperties;

    @Override
    protected void configRouter(final Router router) {
//        router.get("")
    }


}
