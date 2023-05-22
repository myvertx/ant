<script setup lang="ts">
import { FileRa } from '@/mo/FileRa';
import { Ro } from '@/ro/Ro';
import { useFavoriteStore } from '@/store/FavoriteStore';
import { usePathStore } from '@/store/PathStore';

/** 当前组件实例 */
const app = getCurrentInstance();
/** 全局属性 */
const globalProperties = app?.appContext.config.globalProperties;
/** HTTP请求对象 */
const request = globalProperties?.$request;

// ****** 中央状态 ******
// 收藏
let { selected: selectedFavorite, selectListData } = $(useFavoriteStore());
let { setPath } = $(usePathStore());

/** 收藏菜单点击事件 */
function onSelect(item: { key: string }) {
    const path = item.key;
    // 发出get请求
    request
        ?.get({
            url: '/ant/file/list',
            params: { path },
        })
        // 处理返回的结果
        .then((ro: Ro) => {
            if (ro.result > 0) {
                selectedFavorite = path;
                setPath(path, ro.extra as FileRa[]);
            }
        });
}
</script>

<template>
    <SelectList :selectedItemKey="selectedFavorite" :data="selectListData" @select="onSelect" />
</template>
