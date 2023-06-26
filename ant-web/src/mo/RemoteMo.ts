import { ColumnMo } from "./ColumnMo";
import { FavoriteMo } from "./FavoriteMo";
import { PathColumnWidthMo } from "./PathColumnWidthMo";

export interface RemoteMo {
    /** 远端名称 */
    name: string;
    /** 基础路径 */
    basePath: string;
    /** 收藏的宽度 */
    favoriteWidth: string;
    /** 当前收藏索引 */
    curFavoriteIndex: number;
    /** 收藏列表 */
    favorites: FavoriteMo[];
    /** 当前列索引 */
    curColumnIndex: number;
    /** 列列表 */
    columns: ColumnMo[];
    /** 路径列宽度列表 */
    pathColumnWidths: PathColumnWidthMo[];
}
