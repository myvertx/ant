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
    <!-- <el-dialog v-model="uploadDialogVisible">
        <el-upload
            class="upload-demo"
            drag
            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            multiple
        >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
            <template #tip>
                <div class="el-upload__tip">jpg/png files with a size less than 500kb</div>
            </template>
        </el-upload>
    </el-dialog> -->
</template>

<style lang="scss" scoped>
.center {
    flex-grow: 1;
    display: flex;
    justify-content: flex-start;
    .left {
        background-color: $bg-color-nav;
    }
    .client {
        background-color: $bg-color-base;
        flex-grow: 1;
        display: flex;
    }
}
</style>
