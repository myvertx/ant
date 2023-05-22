<script setup lang="ts">
import { useFavoriteStore } from '@/store/FavoriteStore';

// ****** 中央状态 ******
// 收藏
let { width: favoriteWidth } = $(useFavoriteStore());

</script>

<template>
    <div class="header">
        <h1 class="title">MyVertx Ant</h1>
    </div>
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
.header {
    display: flex;
    height: 60px;
    .title {
        height: 60px;
        line-height: 60px;
        margin: 0;
        padding: 0 20px;
    }
}
.center {
    flex-grow: 1;
    display: flex;
    justify-content: flex-start;
    .left {
        background-color: #222;
    }
    .client {
        background-color: #111;
        flex-grow: 1;
        overflow-x: auto;
        display: flex;
    }
}
</style>
