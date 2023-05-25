package myvertx.ant.ra;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UploadRa {
    /**
     * 文件所在目录
     */
    private String fileDir;
    /**
     * 文件名称
     */
    private String fileName;
    /**
     * 文件全路径
     */
    private String fileFullPath;

}
