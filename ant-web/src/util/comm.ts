export function byteConvert(bytes: number) {
    if (isNaN(bytes)) {
        return '';
    }
    let symbols = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let exp = Math.floor(Math.log(bytes) / Math.log(2));
    if (exp < 1) {
        exp = 0;
    }
    let i = Math.floor(exp / 10);
    bytes = bytes / Math.pow(2, 10 * i);

    const bytesStr = bytes.toString().length > bytes.toFixed(2).toString().length ? bytes.toFixed(2) : bytes;

    return bytesStr + ' ' + symbols[i];
}
