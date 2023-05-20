<script setup lang="ts">
import { useFavoriteStore } from '@/store/FavoriteStore';

// ****** 中央状态 ******
// 收藏
let { selectedKeys, list: favorites } = $(useFavoriteStore());

/** 收藏菜单点击事件 */
function onClick(e: { key: string }) {
    const path = e.key;
    selectedKeys = [path];
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
