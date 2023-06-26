<script setup lang="ts">
import { useRemoteStore } from '@/store/RemoteStore';

// ****** 中央状态 ******
// 远端
let { favoriteWidth, setFavoriteWidth } = $(useRemoteStore());
</script>

<template>
    <Header />
    <div class="center">
        <div class="left" :style="{ flexBasis: favoriteWidth }">
            <Favorite />
        </div>
        <Splitter @resized="setFavoriteWidth" />
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
