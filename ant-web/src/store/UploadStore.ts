// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`)

import { UploadFile } from 'ant-design-vue';

// 第一个参数是你的应用中 Store 的唯一 ID。
export const useUploadStore = defineStore('uploadStore', {
    state: (): State => ({
        fileList: [],
    }),
    getters: {
        /** 所有文件上传的平均进度 */
        percent(state: State) {
            let sum = 0;
            let count = 0;
            for (const file of state.fileList) {
                sum += file.percent || 0;
                count++;
            }
            return sum / count;
        },
    },
    actions: {
        /** 清理上传(在beforeUpload中禁止的上传仍然会加入列表中) */
        clearUpload() {
            for (let i = this.fileList.length - 1; i >= 0; i--) {
                if (!this.fileList[i].status) {
                    this.fileList.splice(i, 1);
                }
            }
        },
        /** 完成上传 */
        completeUpload(file: UploadFile) {
            this.cancelUpload(file);
        },
        /** 取消上传 */
        cancelUpload(file: UploadFile) {
            for (let i = 0; i < this.fileList.length; i++) {
                if (this.fileList[i].uid === file.uid) {
                    this.fileList.splice(i, 1);
                    return;
                }
            }
        },
    },
    persist: true,
});

// interface UploadFile {
//     uid: string;
//     /** 文件名称 */
//     name: string;
//     /** 文件大小 */
//     size: number;
//     /** 文件上传进度 */
//     percent: number;
//     /** 文件上传状态 */
//     status: 'uploading' | 'done' | 'error' | 'removed';
// }

interface State {
    /**
     * 上传的文件列表
     */
    fileList: UploadFile[];
}

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUploadStore, import.meta.hot));
}
