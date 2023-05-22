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
        <div class="favorite" :style="{ flexBasis: favoriteWidth }">
            <Favorite />
        </div>
        <Splitter @resized="(size:string) => (favoriteWidth = size)" />
        <div class="explorer">
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
    .favorite {
        background-color: #222;
    }
    .explorer {
        background-color: #111;
        flex-grow: 1;
        display: flex;
    }
}
</style>
