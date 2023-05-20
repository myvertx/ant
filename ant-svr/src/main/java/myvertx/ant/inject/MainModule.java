package myvertx.ant.inject;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import io.vertx.core.json.JsonObject;
import myvertx.ant.config.MainProperties;

import javax.inject.Named;
import javax.inject.Singleton;

public class MainModule extends AbstractModule {

    @Singleton
    @Provides
    public MainProperties getMainProperties(@Named("config") final JsonObject config) {
        return config.getJsonObject("main").mapTo(MainProperties.class);
    }

}
