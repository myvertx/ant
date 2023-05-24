/** 字节转换 */
export function byteConvert(size: number) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    size = Math.abs(size);
    let i = 0;
    for (; size >= 1024 && i < 4; i++) size /= 1024;
    return (size < 0 ? '-' : '') + size.toFixed(2) + units[i];
}
