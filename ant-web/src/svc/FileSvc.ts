import { Ro } from '@/ro/Ro';

import { useRemoteStore } from '@/store/RemoteStore';
import { FILE_EXIST_URI, FILE_LIST_URI, FILE_OVERWRITE_URI } from '@/uri/FileUri';
import { request } from '@/util/request';
import { AxiosProgressEvent } from 'axios';

export const fileSvc = {
    /**
     * 查询指定路径下的文件列表
     * @param path 指定的路径
     */
    list(path: string): Promise<Ro> {
        let { curRemote } = $(useRemoteStore());
        // 发出get请求
        return request.get({
            url: curRemote.basePath + FILE_LIST_URI,
            params: { path },
        });
    },
    exist(dstFilePath: string, hash: string): Promise<Ro> {
        let { curRemote } = $(useRemoteStore());
        // 发出get请求
        return request.get({
            url: curRemote.basePath + FILE_EXIST_URI,
            params: { dstFilePath, hash },
        });
    },
    /**
     * 上传文件
     * @param url 上传的地址
     * @param controller 上传控制器
     * @param formData 上传的数据
     * @param onUploadProgress 上传进度改变事件
     */
    upload(
        url: string,
        controller: AbortController,
        formData: FormData,
        onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
    ): Promise<Ro> {
        return request.post({
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 0, // 设置超时时间
            url,
            signal: controller.signal,
            data: formData,
            onUploadProgress,
        });
    },
    /**
     * 覆盖文件
     * @param remoteBasePath 远端的基础路径
     * @param data 提交的数据
     */
    overwrite(remoteBasePath: string, data: any): Promise<Ro> {
        return request.post({
            url: remoteBasePath + FILE_OVERWRITE_URI,
            data,
        });
    },
};
