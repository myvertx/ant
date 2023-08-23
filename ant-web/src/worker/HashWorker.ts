import CryptoJS from 'crypto-js';

onmessage = function (e) {
    const { data: file } = e;
    const sha256 = CryptoJS.algo.SHA256.create();
    const reader = new FileReader();

    // 文件结束位置
    const fileSize = file.size;
    // 默认缓冲区大小为2M
    const chunkSize = 2 * 1024 * 1024;
    // 块开始位置
    let chunkStart = 0;
    // 块结束位置
    let chunkEnd = Math.min(fileSize, chunkSize);

    reader.onload = () => {
        sha256.update(CryptoJS.lib.WordArray.create(reader.result));
        if (chunkEnd === fileSize) {
            const hash = sha256.finalize().toString();
            this.postMessage(hash);
        } else {
            chunkStart += chunkSize;
            chunkEnd = Math.min(fileSize, chunkStart + chunkSize);
            reader.readAsArrayBuffer(file.slice(chunkStart, chunkEnd));
        }
    };

    reader.readAsArrayBuffer(file.slice(chunkStart, chunkEnd));
};
