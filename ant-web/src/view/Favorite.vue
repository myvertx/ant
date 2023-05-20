<script setup lang="ts">
import { Ro } from '@/ro/Ro';
import { useFavoriteStore } from '@/store/FavoriteStore';

/** 当前组件实例 */
const app = getCurrentInstance();
/** 全局属性 */
const globalProperties = app?.appContext.config.globalProperties;
/** HTTP请求对象 */
const request = globalProperties?.$request;

// ****** 中央状态 ******
// 收藏
let { selectedKeys, list: favorites } = $(useFavoriteStore());

/** 收藏菜单点击事件 */
function onClick(e: { key: string }) {
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
            }
        });
}
</script>

<template>
    <a-menu v-model:selectedKeys="selectedKeys" @click="onClick">
        <a-menu-item v-for="favorite in favorites" :key="favorite.path">{{ favorite.name }}</a-menu-item>
    </a-menu>
</template>

<style lang="less" scoped>
.ant-menu {
    height: 100%;
}
</style>
