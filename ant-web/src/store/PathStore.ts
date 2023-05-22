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
        setPath(path: string, fileMos: FileRa[]) {
            this.selected = path;
            const files: File[] = [];
            for (const fileMo of fileMos) {
                files.push({ ...fileMo, key: fileMo.path });
            }
            this.columns = [];
            this.columns.push({
                path,
                files,
            });
        },
        addPath(path: string, fileMos: FileRa[]) {
            this.selected = path;
            const files: File[] = [];
            for (const fileMo of fileMos) {
                files.push({ ...fileMo, key: fileMo.path });
            }
            // this.columns = [];
            this.columns.push({
                path,
                files,
            });
            console.log('columns', this.columns);
        },
        selectColumnFile(columnPath: string, filePath: string) {
            console.log('columnPath', columnPath, 'filePath', filePath);

            for (const column of this.columns) {
                if (column.path === columnPath) {
                    column.selectedFile = filePath;
                }
            }
        },
    },
    persist: true,
});

interface Column {
    /** 选择的文件(名称) */
    selectedFile?: string;
    /** 路径 */
    path: string;
    /** 文件或目录列表 */
    files: File[];
    /** 列宽度 */
    width?: string;
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
