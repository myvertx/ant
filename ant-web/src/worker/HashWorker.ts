import CryptoJS from 'crypto-js';

onmessage = function (e) {
    const { data: file } = e;
    console.log('You said: ', file);

    const reader = new FileReader();
    reader.onload = () => {
        const sha256 = CryptoJS.algo.SHA256.create();
        sha256.update(CryptoJS.lib.WordArray.create(reader.result));
        const hash = sha256.finalize().toString();
        this.postMessage(hash);
    };
    reader.readAsArrayBuffer(file);
};
