import { requestBasePath, requestRemoteName, requestRemotes } from '@/env';
import { ColumnMo } from '@/mo/ColumnMo';
import { FavoriteMo } from '@/mo/FavoriteMo';
import { FileMo } from '@/mo/FileMo';
import { PathColumnWidthMo } from '@/mo/PathColumnWidthMo';
import { RemoteMo } from '@/mo/RemoteMo';

// 从环境变量中初始化远端列表
const remotes: RemoteMo[] = [];
remotes.push({
    name: requestRemoteName,
    basePath: requestBasePath,
} as RemoteMo);
remotes.push(...requestRemotes);

// 你可以对 `defineStore()` 的返回值进行任意命名，但最好使用 store 的名字，同时以 `use` 开头且以 `Store` 结尾。(比如 `useUserStore`，`useCartStore`，`useProductStore`)

// 第一个参数是你的应用中 Store 的唯一 ID。
export const useRemoteStore = defineStore('remoteStore', {
    state: (): State => ({
        curRemoteIndex: 0,
        remotes: remotes,
    }),
    getters: {
        /** 当前远端 */
        curRemote: (state) => state.remotes[state.curRemoteIndex],
        /** 收藏的宽度 */
        favoriteWidth(): string {
            if (!this.curRemote.favoriteWidth) return '100px';
            return this.curRemote.favoriteWidth;
        },
        /** 当前收藏列表 */
        favorites(): FavoriteMo[] {
            if (this.curRemote.favorites === undefined) {
                this.curRemote.favorites = [
                    {
                        name: '根目录',
                        path: '/',
                    },
                ];
            }
            return this.curRemote.favorites;
        },
        /** 当前收藏索引 */
        curFavoriteIndex(): number {
            if (this.curRemote.curFavoriteIndex === undefined) this.curRemote.curFavoriteIndex = -1;
            return this.curRemote.curFavoriteIndex;
        },
        /** 当前收藏 */
        curFavorite(): FavoriteMo {
            return this.favorites[this.curFavoriteIndex];
        },
        /** 当前列列表 */
        columns(): ColumnMo[] {
            if (!this.curRemote.columns) this.curRemote.columns = [];
            return this.curRemote.columns;
        },
        /** 当前列索引 */
        curColumnIndex(): number {
            return this.curRemote.curColumnIndex;
        },
        /** 当前列 */
        curColumn(): ColumnMo {
            return this.columns[this.curColumnIndex];
        },
        /** 当前列路径 */
        curColumnPath(): string {
            return this.curColumn?.path;
        },
        /** 路径列宽度列表 */
        pathColumnWidths(): PathColumnWidthMo[] {
            if (!this.curRemote.pathColumnWidths) this.curRemote.pathColumnWidths = [];
            return this.curRemote.pathColumnWidths;
        },
    },
    actions: {
        /** 添加远端 */
        addRemote(remote: RemoteMo) {
            this.remotes.push(remote);
        },
        /** 设置收藏的宽度 */
        setFavoriteWidth(width: string) {
            this.curRemote.favoriteWidth = width;
        },
        /** 通过路径获取路径列的宽度 */
        getPathColumnWidth(path: string): string {
            for (const pathColumnWidth of this.pathColumnWidths) {
                if (pathColumnWidth.path === path) return pathColumnWidth.width;
            }
            return '200px';
        },
        /** 设置路径列的宽度 */
        setPathColumnWidth(path: string, width: string) {
            for (const pathColumnWidth of this.pathColumnWidths) {
                if (pathColumnWidth.path === path) {
                    pathColumnWidth.width = width;
                    return;
                }
            }
            this.pathColumnWidths.push({ path, width });
        },
        /**
         * 选择收藏
         * @param favoriteIndex 收藏的索引
         * @param fileMos 查询到的文件列表
         */
        selectFavorite(favoriteIndex: number, fileMos: FileMo[]) {
            this.curRemote.curFavoriteIndex = favoriteIndex;
            this.clearAllColumns();
            this.addColumn(this.curFavorite.path, fileMos);
            this.setCurColumnIndex(0);
        },
        getColumnByPath(columnPath: string): ColumnMo | null {
            for (const column of this.columns) {
                if (column.path === columnPath) {
                    return column;
                }
            }
            return null;
        },
        /**
         * 设置当前列索引
         * @param columnIndex 要设置当前列的列索引
         */
        setCurColumnIndex(columnIndex: number) {
            this.curRemote.curColumnIndex = columnIndex;
        },
        /**
         * 清空所有列
         */
        clearAllColumns() {
            this.setCurColumnIndex(-1);
            this.clearColumnsAfterCurColumn();
        },
        /**
         * 清空当前列之后的所有列
         */
        clearColumnsAfterCurColumn() {
            if (!this.columns) return;
            // ??? 这里不知道为什么用slice删除元素无效
            for (let i = this.columns.length - 1; i >= 0; i--) {
                if (i === this.curColumnIndex) return;
                this.columns.pop();
            }
        },
        /**
         * 添加新的列
         * @param path 新列的路径
         * @param files 新列的文件列表
         */
        addColumn(path: string, files: FileMo[]) {
            files.sort((a: FileMo, b: FileMo) => {
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
                selectedFileIndices: [],
            });
        },
        /**
         * 清空指定列中选择的文件
         * @param columnIndex 指定列的索引
         */
        clearSelecteFiles(columnIndex: number) {
            this.columns[columnIndex].selectedFileIndices = [];
        },
        /**
         * 选择目录
         * @param dirFileIndex 目录文件的索引
         * @param fileMos 查询到的文件列表
         */
        selectDir(dirFileIndex: number, fileMos: FileMo[]) {
            this.curColumn.selectedFileIndices = [dirFileIndex];
            this.addColumn(this.curColumn.files[dirFileIndex].path, fileMos);
        },
        /**
         * 选择指定列中的文件
         * @param columnIndex 指定列的索引
         * @param filePath 要选择文件的路径
         */
        selectFiles(fileIndies: number[]) {
            this.curColumn.selectedFileIndices = fileIndies;
        },
        /** 在指定列中添加文件 */
        addFileInColumn(columnPath: string, file: FileMo) {
            const column = this.getColumnByPath(columnPath);
            if (column === null) return;
            for (const columnFile of column.files) {
                if (file.path === columnFile.path) return;
            }
            column.files.push(file);
        },
    },
    persist: true,
});

interface State {
    /** 当前远端索引 */
    curRemoteIndex: number;
    /** 远端列表 */
    remotes: RemoteMo[];
}

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useRemoteStore, import.meta.hot));
}
