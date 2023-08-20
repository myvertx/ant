// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`)

import { useRemoteStore } from './RemoteStore.ts';
import { fileSvc } from '@/svc/FileSvc';
import { AxiosProgressEvent } from 'axios';
// @ts-ignore
import sha256 from 'crypto-js/sha256';
import { ulid } from 'ulid';

// import { UploadFile } from 'element-plus';

/** 定时器 */
let timer: NodeJS.Timeout;

// 第一个参数是你的应用中 Store 的唯一 ID。
export const useUploadStore = defineStore('uploadStore', {
    state: (): State => {
        return {
            uploadFiles: [],
            uploadingFiles: [],
            internal: 1000,
            maxCount: 500,
        };
    },
    getters: {
        /** 所有文件上传的平均进度 */
        percent(state: State) {
            // 计算已上传的总字节数
            let uploadedSum = 0;
            for (const loadingFile of state.uploadingFiles) {
                uploadedSum += loadingFile.loaded || 0;
            }

            // 计算总共要上传的字节数
            let total = 0;
            for (const uploadFile of state.uploadFiles) {
                if (uploadFile.status in [UploadStatus.Preparing, UploadStatus.Ready, UploadStatus.Uploading]) {
                    total += uploadFile.size;
                }
            }

            // 平均求总进度
            return total ? uploadedSum / total : 100;
        },
    },
    actions: {
        /**
         * 计算hash值
         */
        calcHash() {
            for (const uploadFile of this.uploadFiles) {
                if (uploadFile.status === UploadStatus.Preparing && !uploadFile.hash) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = new Uint8Array(reader.result as ArrayBuffer);
                        const hash = sha256(result).toString();
                        uploadFile.hash = hash;
                        uploadFile.status = UploadStatus.Ready;
                    };
                    reader.readAsArrayBuffer(uploadFile.file);
                }
            }
        },
        /**
         * 添加任务
         * @param remoteName 远端名称
         * @param dstDir 上传目的地的目录
         * @param url 上传的地址
         * @param files 上传的文件列表
         */
        addTask(remoteName: string, dstDir: string, url: string, files: FileList) {
            const taskId = ulid();
            for (const file of files) {
                this.uploadFiles.push({
                    id: ulid(),
                    taskId,
                    size: file.size,
                    remoteName,
                    dstDir,
                    status: UploadStatus.Preparing,
                    url,
                    file,
                });
            }
            this.calcHash();
        },
        /** 取消上传 */
        cancelUpload(uploadFileId: string) {
            for (let i = 0; i < this.uploadFiles.length; i++) {
                const uploadFile = this.uploadFiles[i];
                if (uploadFileId === uploadFile.id) {
                    this.cancelUploading(uploadFile);
                    this.uploadFiles.splice(i, 1);
                    return;
                }
            }
            return;
        },
        /** 运行任务 */
        runTasks() {
            /** 定时器 */
            timer = setTimeout(() => {
                let idleCount = this.maxCount - this.uploadingFiles.length;
                console.log('idleCount', idleCount);
                for (const uploadFile of this.uploadFiles) {
                    // 如果状态在上传中，但是在上传中队列找不到了(可能是刷新/关闭过页面了)，那么状态先设置回准备好
                    if (uploadFile.status === UploadStatus.Uploading && !this.isUploading(uploadFile)) {
                        uploadFile.status = UploadStatus.Ready;
                    }

                    // 判断是否要上传
                    if (uploadFile.status === UploadStatus.Ready && !this.isUploading(uploadFile)) {
                        if (idleCount > 0) {
                            this.upload(uploadFile);
                            idleCount = this.maxCount - this.uploadingFiles.length;
                        }
                        continue;
                    }
                    // 判断是否要取消上传
                    else if (uploadFile.status !== UploadStatus.Ready && this.isUploading(uploadFile)) {
                        this.cancelUploading(uploadFile);
                        if (uploadFile.status === UploadStatus.Success) {
                            const remoteStore = useRemoteStore();
                            remoteStore.refreshColmnByPath(uploadFile.remoteName, uploadFile.dstDir);
                        }
                        continue;
                    } else if (uploadFile.status === UploadStatus.Success) {
                    }
                }

                clearTimeout(timer);
                this.runTasks();
            }, this.internal);
        },
        /**
         * 文件是否在上传中
         * @param uploadFile 上传文件
         */
        isUploading(uploadFile: UploadFile): boolean {
            for (const uploadingFile of this.uploadingFiles) {
                if (uploadingFile.id === uploadFile.id) return true;
            }
            return false;
        },
        /**
         * 取消上传
         * @param uploadFile 上传的文件
         */
        cancelUploading(uploadFile: UploadFile) {
            for (let i = this.uploadingFiles.length - 1; i >= 0; i--) {
                const uploadingFile = this.uploadingFiles[i];
                if (uploadingFile.id === uploadFile.id) {
                    uploadingFile.controller.abort();
                    this.uploadingFiles.splice(i, 1);
                    return;
                }
            }
        },
        /**
         * 上传
         * @param uploadFile 上传文件
         */
        upload(uploadFile: UploadFile) {
            // 状态设置为上传中
            uploadFile.status = UploadStatus.Uploading;
            // 上传控制器
            const controller = new AbortController();
            const uploadingFile: UploadingFile = { id: uploadFile.id, controller, loaded: 0, percent: 0, rate: 0 };
            // 添加到上传中的文件ID列表
            this.uploadingFiles.push(uploadingFile);
            // 配置上传的数据
            const formData = new FormData();
            formData.append('id', uploadFile.id);
            formData.append('dstDir', uploadFile.dstDir);
            formData.append('hash', uploadFile.hash as string);
            formData.append('file', uploadFile.file);
            // 上传进度改变事件
            const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
                console.log('progressEvent', progressEvent);
                uploadingFile.loaded = progressEvent.loaded;
                uploadingFile.percent = (progressEvent.progress as number) * 100;
                uploadingFile.rate = progressEvent.rate as number;
            };
            // 上传
            fileSvc
                .upload(uploadFile.url, controller, formData, onUploadProgress)
                .then((ro) => {
                    if (ro.result > 0) {
                        this.uploadSuccess(uploadFile);
                    } else {
                        this.uploadFail(uploadFile);
                    }
                })
                .catch(() => this.uploadFail(uploadFile));
        },
        uploadSuccess(uploadFile: UploadFile) {
            uploadFile.status = UploadStatus.Success;
        },
        uploadFail(uploadFile: UploadFile) {
            uploadFile.status = UploadStatus.Fail;
        },
    },
    persist: {
        // 部分持久化，上传中文件ID列表不持久化
        paths: ['tasks', 'maxCount'],
    },
});

interface State {
    /** 上传文件列表 */
    uploadFiles: UploadFile[];
    /** 上传中的文件ID列表 */
    uploadingFiles: UploadingFile[];
    /** 运行任务定时器执行间隔(单位毫秒) */
    internal: number;
    /** 最大同时上传文件的数量 */
    maxCount: number;
}

/** 上传任务中的文件 */
export interface UploadFile {
    /** 上传文件ID */
    id: string;
    /** 任务ID */
    taskId: string;
    /** 上传文件的大小(单位是字节) */
    size: number;
    /** 上传文件hash */
    hash?: string;
    /** 上传状态 */
    status: UploadStatus;
    /** 远端名称 */
    remoteName: string;
    /** 上传目的地的目录(也是列路径) */
    dstDir: string;
    /** 上传的url */
    url: string;
    /** 上传文件信息 */
    file: File;
}

export interface UploadingFile {
    /** 上传文件ID */
    id: string;
    /** 上传进度(0-100) */
    percent: number;
    /** 已上传字节数 */
    loaded: number;
    /** 上传速率(每秒传输字节数) */
    rate: number;
    /** 上传控制器 */
    controller: AbortController;
}

/** 上传状态 */
export enum UploadStatus {
    /** 取消上传 */
    Cancel,
    /** 正在准备 */
    Preparing,
    /** 准备好 */
    Ready,
    /** 上传中 */
    Uploading,
    /** 询问中 */
    Questioning,
    /** 上传成功 */
    Success,
    /** 上传失败 */
    Fail,
}

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUploadStore, import.meta.hot));
}
