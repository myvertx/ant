<script setup lang="ts">
import { FavoriteMo } from '@/mo/FavoriteMo';
import { FileMo } from '@/mo/FileMo';
import { Ro } from '@/ro/Ro';
import { useRemoteStore } from '@/store/RemoteStore';
import { fileSvc } from '@/svc/FileSvc';

// ****** 中央状态 ******
// 远端
let { favorites, curFavoriteIndex, selectFavorite } = $(useRemoteStore());

/**
 * 选择收藏事件
 * @param favorite 收藏的项目
 * @param favoriteIndex 收藏项目的索引
 */
function onSelect(favorite: FavoriteMo, favoriteIndex: number) {
    fileSvc
        .list(favorite.path)
        // 处理返回的结果
        .then((ro: Ro) => {
            if (ro.result > 0) {
                selectFavorite(favoriteIndex, ro.extra as FileMo[]);
            }
        });
}
</script>

<template>
    <SelectList :isActived="false" :selectedItemIndices="[curFavoriteIndex]" :data="favorites" @select="onSelect" />
</template>
