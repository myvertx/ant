// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`)

import { contactPath, getFileDir } from '@/util/path';
import { request } from '@/util/request';
import { ulid } from 'ulid';

// import { UploadFile } from 'element-plus';

// 第一个参数是你的应用中 Store 的唯一 ID。
export const useUploadStore = defineStore('uploadStore', {
    state: (): State => ({
        tasks: [],
        uploadingFiles: [],
        maxCount: 500,
    }),
    getters: {
        /** 所有文件上传的平均进度 */
        percent(state: State) {
            let sum = 0;
            let count = 0;
            for (const task of state.tasks) {
                for (const uploadFile of task.uploadFiles) {
                    sum += uploadFile.percent || 0;
                    count++;
                }
            }
            return sum / count;
        },
    },
    actions: {
        /**
         * 添加任务
         * @param url 上传的地址
         * @param dstDir 上传目的地的目录
         * @param files 上传的文件列表
         */
        addTask(url: string, dstDir: string, files: FileList) {
            const uploadFiles: UploadFile[] = [];
            for (const file of files) {
                uploadFiles.push({
                    id: ulid(),
                    // dstDir: contactPath(dstDir, getFileDir(file.webkitRelativePath)),
                    dstDir,
                    percent: 0,
                    status: UploadStatus.Ready,
                    url,
                    file,
                });
            }
            this.tasks.push({
                id: ulid(),
                uploadFiles: uploadFiles,
            });
            this.runTasks();
        },
        /** 取消上传任务 */
        cancelTask(task: UploadTask) {
            for (let i = this.tasks.length - 1; i >= 0; i--) {
                if (this.tasks[i].id === task.id) {
                    for (const uploadFile of this.tasks[i].uploadFiles) {
                        this.cancelUpload(uploadFile);
                    }
                    this.tasks.splice(i, 1);
                    return;
                }
            }
        },
        /** 运行任务 */
        runTasks() {
            const idleCount = this.maxCount - this.uploadingFiles.length;
            for (let i = 0; i < idleCount; i++) {
                for (const task of this.tasks) {
                    for (const uploadFile of task.uploadFiles) {
                        if (uploadFile.status === UploadStatus.Ready && !this.isUploading(uploadFile)) {
                            this.upload(uploadFile);
                            continue;
                        }
                    }
                }
            }
        },
        /**
         * 文件是否在上传中
         * @param uploadFile 上传文件
         */
        isUploading(uploadFile: UploadFile): boolean {
            for (const id of this.uploadingFiles) {
                if (id === uploadFile.id) return true;
            }
            return false;
        },
        /** 取消上传 */
        cancelUpload(uploadFile: UploadFile) {
            for (let i = this.uploadingFiles.length - 1; i >= 0; i--) {
                if (this.uploadingFiles[i] === uploadFile.id) {
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
            this.uploadingFiles.push(uploadFile.id);
            const formData = new FormData();
            formData.append('dstDir', uploadFile.dstDir);
            formData.append('id', uploadFile.id);
            formData.append('file', uploadFile.file);
            request.post({
                url: uploadFile.url,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                data: formData,
            });
        },
    },
    persist: {
        // 部分持久化，上传中文件ID列表不持久化
        paths: ['tasks', 'maxCount'],
    },
});

interface State {
    /**
     * 上传任务列表
     */
    tasks: UploadTask[];
    /**
     * 上传中的文件ID列表
     */
    uploadingFiles: string[];
    /**
     * 最大同时上传文件的数量
     */
    maxCount: number;
}

/** 上传任务 */
interface UploadTask {
    /** 上传任务ID */
    id: string;
    /** 上传任务文件列表 */
    uploadFiles: UploadFile[];
}

/** 上传任务中的文件 */
interface UploadFile {
    /** 上传文件ID */
    id: string;
    /** 上传目的地的目录 */
    dstDir: string;
    /** 上传进度(0-100) */
    percent: number;
    /** 上传的状态 */
    status: UploadStatus;
    /** 上传的url */
    url: string;
    /** 上传文件信息 */
    file: File;
}

/** 上传状态 */
enum UploadStatus {
    /** 取消上传 */
    Cancel,
    /** 准备好 */
    Ready,
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
