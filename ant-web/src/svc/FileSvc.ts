import { Ro } from '@/ro/Ro';

import { useRemoteStore } from '@/store/RemoteStore';
import { LIST_FILE_URI } from '@/uri/FileUri';
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
    /**
     * 上传文件
     * @param url 上传的地址
     * @param controller 上传控制器
     * @param formData 上传的数据
     */
    upload(url: string, controller: AbortController, formData: FormData): Promise<Ro> {
        return request.post({
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            url,
            signal: controller.signal,
            data: formData,
        });
    },
};
