// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`)

// 第一个参数是你的应用中 Store 的唯一 ID。
export const useFavoriteStore = defineStore('favoriteStore', {
    state: (): State => ({
        width: 100,
        selected: '/',
        list: [
            {
                name: '根目录',
                path: '/',
            },
        ],
    }),
    getters: {
        /** 当前收藏的路径 */
        curPath: (state) => state.selected,
        selectListData: (state) => {
            const selectListData = [];
            for (const favorite of state.list) {
                selectListData.push({ key: favorite.path, name: favorite.name });
            }
            return selectListData;
        },
    },
    persist: true,
});

interface Favorite {
    /** 名称 */
    name: string;
    /** 路径 */
    path: string;
}

interface State {
    /** 面板的宽度 */
    width: number;
    /** 当前选择的收藏(路径) */
    selected: string;
    /** 收藏列表 */
    list: Favorite[];
}

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useFavoriteStore, import.meta.hot));
}
