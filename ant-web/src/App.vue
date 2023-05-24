<script setup lang="ts">
import { useFavoriteStore } from '@/store/FavoriteStore';

// ****** 中央状态 ******
// 收藏
let { width: favoriteWidth } = $(useFavoriteStore());
</script>

<template>
    <Header />
    <div class="center">
        <div class="left" :style="{ flexBasis: favoriteWidth }">
            <Favorite />
        </div>
        <Splitter @resized="(size:string) => (favoriteWidth = size)" />
        <div class="client">
            <Explorer />
        </div>
    </div>
</template>

<style lang="less" scoped>
.center {
    flex-grow: 1;
    display: flex;
    justify-content: flex-start;
    .left {
        background-color: @background-color-heavier;
    }
    .client {
        background-color: @background-color-base;
        flex-grow: 1;
        overflow-x: auto;
        display: flex;
    }
}
</style>
