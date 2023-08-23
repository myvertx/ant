package myvertx.ant.ra;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FileOverwriteRa {
    /**
     * 临时文件路径
     */
    private String tempFilePath;
    /**
     * 目的地文件路径
     */
    private String dstFilePath;
}
