package myvertx.ant.config;

import lombok.Data;

@Data
public class MainProperties {
    /**
     * 上传临时文件的路径(相对于运行程序的路径下)
     */
    private String temp;

    /**
     * 管理目录的根路径(相对于运行程序的路径下)
     */
    private String root;

    /**
     * 上传文件大小限制
     */
    private String uploadFileSizeLimit;
}
