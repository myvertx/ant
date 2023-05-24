package myvertx.ant.ra;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileUploadRa {
    /**
     * 发到后台的文件参数名
     */
    private String name;
    /**
     * 保存好的文件名(带file-uploads目录的相对路径)
     */
    private String uploadedFileName;
    /**
     * 上传的原始文件名
     */
    private String fileName;
    /**
     * 文件大小
     */
    private Long size;
    /**
     * 文件类型
     */
    private String contentType;
    /**
     * the content transfer encoding of the upload - this describes how the upload was encoded in the form submission.
     */
    private String contentTransferEncoding;
    /**
     * 文件编码
     */
    private String charSet;

}
