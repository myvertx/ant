// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`)

// 第一个参数是你的应用中 Store 的唯一 ID。
export const useColumnWidthStore = defineStore('columnWidthStore', {
    state: (): State => ({
        /** FIXME pinia-plugin-persistedstate不支持map，临时用数组代替 */
        entrySet: [],
    }),
    getters: {
        get: (state: State) => (key: string) => {
            for (const entry of state.entrySet) {
                if (entry.key === key) return entry.value;
            }
            return undefined;
        },
    },
    actions: {
        set(key: string, value: string) {
            for (const entry of this.entrySet) {
                if (entry.key === key) {
                    entry.value = value;
                    return;
                }
            }
            this.entrySet.push({ key, value });
        },
    },
    persist: true,
});

interface Entry {
    key: string;
    value: string;
}
interface State {
    /**
     * 列宽度列表
     * key为列的path，value为列的width
     */
    entrySet: Entry[];
}

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useColumnWidthStore, import.meta.hot));
}
