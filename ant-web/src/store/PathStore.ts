// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`)

import { ColumnMo } from '@/mo/ColumnMo';
import { FileMo } from '@/mo/FileMo';

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
        setPath(path: string, files: FileMo[]) {
            this.selected = path;
            this.columns = [];
            this.columns.push({
                path,
                files,
                width: '300px',
            });
        },
    },
    persist: true,
});

interface State {
    /** 当前选择的路径 */
    selected: string;
    /** 列列表 */
    columns: ColumnMo[];
}

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(usePathStore, import.meta.hot));
}
