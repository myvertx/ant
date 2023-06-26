import { FileMo } from './FileMo';

export interface ColumnMo {
    /** 列路径 */
    path: string;
    /** 文件或目录列表 */
    files: FileMo[];
    /** 选择的文件索引列表 */
    selectedFileIndices: number[];
}
