<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes';
import { FileRa } from '@/ro/FileRa';
import { Ro } from '@/ro/Ro';
import { usePathStore } from '@/store/PathStore';

/** 当前组件实例 */
const app = getCurrentInstance();
/** 全局属性 */
const globalProperties = app?.appContext.config.globalProperties;
/** HTTP请求对象 */
const request = globalProperties?.$request;

// ****** 中央状态 ******
// 收藏
let { columns, setPath, selectColumnFile } = $(usePathStore());

/** 收藏菜单点击事件 */
function onSelect(item: { isDir: boolean; key: string }, columnKey: string) {
    const filePath = item.key;
    if (!item.isDir) {
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
                setPath(filePath, ro.extra as FileRa[]);
            }
        });
}
</script>

<template>
    <!-- <a-menu v-for="column in columns" @select="onSelect" v-bind:style="{ width: column.width }">
        <a-menu-item v-for="file in column.files" :key="file.path">{{ file.name }}</a-menu-item>
    </a-menu> -->
    <!-- 分割面板 https://antoniandre.github.io/splitpanes/ -->
    <!-- <Splitpanes ref="splitpanesRef" @resized="onSplitpanesResized"> -->
    <Splitpanes ref="splitpanesRef">
        <Pane v-for="column in columns" :size="column.width" min-size="10">
            <div class="column">
                <SelectList
                    :componentKey="column.path"
                    :selectedItemKey="column.selectedFile"
                    :data="column.files"
                    @select="onSelect"
                />
            </div>
        </Pane>
    </Splitpanes>
</template>

<style lang="less" scoped>
.column {
    background-color: #111;
    height: 100%;
}
</style>
