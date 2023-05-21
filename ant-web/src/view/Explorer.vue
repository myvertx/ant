<script setup lang="ts">
import { FileMo } from '@/mo/FileMo';
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
let { selected, columns, setPath } = $(usePathStore());

/** 收藏菜单点击事件 */
function onSelect(e: { key: string }) {
    const path = e.key;
    // 发出get请求
    request
        ?.get({
            url: '/ant/file/list',
            params: { path },
        })
        // 处理返回的结果
        .then((ro: Ro) => {
            if (ro.result > 0) {
                setPath(path, ro.extra as FileMo[]);
            }
        });
}
</script>

<template>
    <a-menu v-for="column in columns" @select="onSelect" v-bind:style="{ width: column.width }">
        <a-menu-item v-for="file in column.files" :key="file.path">{{ file.name }}</a-menu-item>
    </a-menu>
</template>
