import { FileMo } from './FileMo';

export interface ColumnMo {
    /** 选择的名称 */
    selectedName?: string;
    /** 路径 */
    path: string;
    /** 文件或目录列表 */
    files: FileMo[];
    width: string;
}
