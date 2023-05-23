<script setup lang="ts">
import { FileRa } from '@/ro/FileRa';
import { Ro } from '@/ro/Ro';
import { usePathStore } from '@/store/PathStore';
import { useColumnWidthStore } from '@/store/ColumnWidthStore';

/** 当前组件实例 */
const app = getCurrentInstance();
/** 全局属性 */
const globalProperties = app?.appContext.config.globalProperties;
/** HTTP请求对象 */
const request = globalProperties?.$request;

// ****** 中央状态 ******
// 收藏
let { columns, addPath, clearColumn, selectColumnFile } = $(usePathStore());
let { get: getColumnWidth, set: setColumnWidth } = $(useColumnWidthStore());

/** 收藏菜单点击事件 */
function onSelect(item: { isDir: boolean; key: string }, columnKey: string) {
    const filePath = item.key;
    if (!item.isDir) {
        clearColumn(columnKey);
        selectColumnFile(columnKey, filePath);
        return;
    }

    // 发出get请求
    request
        ?.get({
            url: '/ant/file/list',
            params: { path: filePath },
        })
        // 处理返回的结果
        .then((ro: Ro) => {
            if (ro.result > 0) {
                clearColumn(columnKey);
                addPath(filePath, ro.extra as FileRa[]);
                selectColumnFile(columnKey, filePath);
            }
        });
}
</script>

<template>
    <template v-for="column in columns">
        <div class="column" :style="{ flexBasis: getColumnWidth(column.path) || '200px' }">
            <SelectList
                :componentKey="column.path"
                :selectedItemKey="column.selectedFile"
                :data="column.files"
                @select="onSelect"
            />
        </div>
        <Splitter @resized="(size:string) => setColumnWidth(column.path, size)" />
    </template>
</template>

<style lang="less" scoped>
.column {
    /** 不缩小 */
    flex-shrink: 0;
    /** 不换行 */
    white-space: nowrap;
}
</style>
