package myvertx.ant.util;

import java.io.BufferedInputStream;
import java.io.DataInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;

public class DigestUtils {
    public static String hash(Path path) throws IOException {
        try (FileInputStream fileInputStream = new FileInputStream(path.toString());
             BufferedInputStream bufferedInputStream = new BufferedInputStream(fileInputStream);
             DataInputStream dataInputStream = new DataInputStream(bufferedInputStream)) {
            return org.apache.commons.codec.digest.DigestUtils.sha256Hex(dataInputStream);
        }
    }
}
