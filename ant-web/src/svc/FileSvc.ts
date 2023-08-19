import { Ro } from '@/ro/Ro';

import { useRemoteStore } from '@/store/RemoteStore';
import { LIST_FILE_URI, UPLOAD_FILE_URI } from '@/uri/FileUri';
import { request } from '@/util/request';

export const fileSvc = {
    /**
     * 查询指定路径下的文件列表
     * @param path 指定的路径
     */
    list(path: string): Promise<Ro> {
        let { curRemote } = $(useRemoteStore());
        // 发出get请求
        return request.get({
            url: curRemote.basePath + LIST_FILE_URI,
            params: { path },
        });
    },
    // upload(file: File) {
    //     let { curRemote, curColumnPath } = $(useRemoteStore());
    //     // 发出get请求
    //     return request.post({
    //         url: curRemote.basePath + UPLOAD_FILE_URI,
    //         headers: {
    //             'Content-Type': 'multipart/form-data',
    //         },
    //         params: { curColumnPath },
    //     });
    // },
};
