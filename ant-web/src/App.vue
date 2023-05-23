<script setup lang="ts">
import { toggleTheme } from '@zougt/vite-plugin-theme-preprocessor/dist/browser-utils';
import { useFavoriteStore } from '@/store/FavoriteStore';
import { useThemeStore } from '@/store/ThemeStore';

// ****** 中央状态 ******
// 收藏
let { width: favoriteWidth } = $(useFavoriteStore());
const themeStore = useThemeStore();
let { curTheme } = $(themeStore);

onMounted(() => {
    toggleTheme({ scopeName: curTheme });
});
</script>

<template>
    <div class="header">
        <h1 class="title">MyVertx Ant</h1>
        <div class="toggle-theme">
            <a-switch
                v-model:checked="curTheme"
                checked-value="dark"
                checked-children="暗黑主题"
                un-checked-value="default"
                un-checked-children="普通主题"
                @change="toggleTheme({ scopeName: curTheme })"
            />
        </div>
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
@header-height: 60px;
.header {
    display: flex;
    height: 60px;
    background-color: @background-color-heaviest;
    .title {
        height: @header-height;
        line-height: @header-height;
        margin: 0;
        padding: 0 20px;
        flex-grow: 1;
    }
    .toggle-theme {
        height: @header-height;
        line-height: @header-height;
        padding: 0 20px;
    }
}
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
