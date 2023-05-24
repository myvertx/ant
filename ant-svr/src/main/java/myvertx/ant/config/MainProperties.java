package myvertx.ant.config;

import lombok.Data;

@Data
public class MainProperties {
    /**
     * 根目录路径
     */
    private String root;

    /**
     * 上传文件大小限制
     */
    private String uploadFileSizeLimit;
}
