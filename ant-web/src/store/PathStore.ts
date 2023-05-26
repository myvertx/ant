// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`)

import { FileRa } from '@/ro/FileRa';

// 第一个参数是你的应用中 Store 的唯一 ID。
export const usePathStore = defineStore('pathStore', {
    state: (): State => ({
        selected: '/',
        columns: [],
    }),
    getters: {
        /** 当前收藏的路径 */
        // curPath: (state) => state.selectedKeys[0],
    },
    actions: {
        pushFiles(path: string, fileMos: FileRa[]) {
            const files: File[] = [];
            for (const fileMo of fileMos) {
                files.push({ ...fileMo, key: fileMo.path });
            }
            files.sort((a: File, b: File) => {
                if (a.isDir && !b.isDir) {
                    return -1;
                } else if (!a.isDir && b.isDir) {
                    return 1;
                }
                return a.name > b.name ? 1 : -1;
            });
            this.columns.push({
                path,
                files,
            });
        },
        setPath(path: string, fileMos: FileRa[]) {
            this.selected = path;
            this.columns = [];
            this.pushFiles(path, fileMos);
        },
        addPath(path: string, fileMos: FileRa[]) {
            this.selected = path;
            this.pushFiles(path, fileMos);
        },
        /**
         * 清空指定路径之后的所有列
         * @param path 指定列的路径
         */
        clearColumn(path: string) {
            for (let i = this.columns.length - 1; i >= 0; i--) {
                if (this.columns[i].path === path) return;
                this.columns.pop();
            }
        },
        /** 在指定列中添加文件 */
        addFileInColumn(columnPath: string, file: FileRa) {
            for (const column of this.columns) {
                if (column.path === columnPath) {
                    // 查找是否已存在
                    for (const columnFile of column.files) {
                        if (file.path === columnFile.path) return;
                    }
                    column.files.push({ ...file, key: file.path });
                }
            }
        },
        /** 选择指定列中的文件 */
        selectFileInColumn(columnPath: string, filePath: string) {
            for (const column of this.columns) {
                if (column.path === columnPath) {
                    column.selectedFile = filePath;
                }
            }
        },
    },
    persist: true,
});

export interface Column {
    /** 选择的文件(名称) */
    selectedFile?: string;
    /** 路径 */
    path: string;
    /** 文件或目录列表 */
    files: File[];
}

interface File extends FileRa {
    key: string;
}

interface State {
    /** 当前选择的路径 */
    selected: string;
    /** 列列表 */
    columns: Column[];
}

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(usePathStore, import.meta.hot));
}
