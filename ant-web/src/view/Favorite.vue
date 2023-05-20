<script setup lang="ts">
import { useFavoriteStore } from '@/store/FavoriteStore';

// ****** 中央状态 ******
// 收藏
let { selectedKeys, list: favorites, setSelectedKeys } = $(useFavoriteStore());

/** 收藏菜单点击事件 */
function onClick(e: { key: string }) {
    setSelectedKeys(e.key);
}
</script>

<template>
    <a-menu v-model:selectedKeys="selectedKeys" mode="inline" @click="onClick">
        <a-menu-item v-for="favorite in favorites" :key="favorite.path">{{ favorite.name }}</a-menu-item>
    </a-menu>
</template>
