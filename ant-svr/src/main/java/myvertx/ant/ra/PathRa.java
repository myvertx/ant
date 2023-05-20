package myvertx.ant.ra;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PathRa {
    /**
     * 是否目录
     */
    private Boolean isDir;
    /**
     * 文件或目录名
     */
    private String name;
    /**
     * 路径
     */
    private String path;
}
