package myvertx.ant.inject;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import io.vertx.core.json.JsonObject;
import myvertx.ant.config.MainProperties;
import org.apache.commons.lang3.StringUtils;
import rebue.wheel.core.BytesConverter;

import javax.inject.Named;
import javax.inject.Singleton;

public class MainModule extends AbstractModule {

    @Singleton
    @Provides
    public MainProperties getMainProperties(@Named("config") final JsonObject config) {
        return config.getJsonObject("main").mapTo(MainProperties.class);
    }

    @Singleton
    @Provides
    @Named("uploadFileSizeLimit")
    public Long getUploadFileSizeLimit(MainProperties mainProperties) {
        String uploadFileSizeLimit = mainProperties.getUploadFileSizeLimit();
        if (StringUtils.isBlank(uploadFileSizeLimit)) return 0L;
        return BytesConverter.convert(uploadFileSizeLimit);
    }
}
