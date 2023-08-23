package myvertx.ant.cq;

public interface ErrorCodeCq {
    /**
     * 文件已经存在
     */
    String FILE_EXIST        = "FILE_EXIST";
    /**
     * 上传的临时文件已被删除
     */
    String TEMP_FILE_REMOVED = "TEMP_FILE_REMOVED";
    /**
     * 哈希校验不正确
     */
    String INVALID_HASH      = "INVALID_HASH";
    /**
     * 页面被刷新
     */
    String PAGE_REFRESHED    = "PAGE_REFRESHED";
}
