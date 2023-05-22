<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useFavoriteStore } from '@/store/FavoriteStore';

// ****** 局部状态 ******
let leftPaneSize = $ref(10);
const splitpanesRef = ref();

// ****** 中央状态 ******
// 收藏
let { width: leftPaneWidth } = $(useFavoriteStore());

/**
 * 通过width计算出size
 * width以px为单位，而size则表示占宽比
 */
function widthToSize(width: number) {
    const clientWidth = splitpanesRef.value.$el.clientWidth;
    return (width / clientWidth) * 100;
}
/**
 * 通过width计算出size
 * width以px为单位，而size则表示占宽比
 */
function sizeToWidth(size: number) {
    const clientWidth = splitpanesRef.value.$el.clientWidth;
    return (clientWidth * size) / 100;
}
/**
 * 分割面板改变面板大小的事件
 */
function onSplitpanesResized(panes: { size: number }[]) {
    leftPaneWidth = sizeToWidth(panes[0].size);
}
/** 装载事件 */
onMounted(() => {
    leftPaneSize = widthToSize(leftPaneWidth);
});
</script>

<template>
    <div class="header">
        <h1 class="title">MyVertx Ant</h1>
    </div>
    <div class="center">
        <!-- 分割面板 https://antoniandre.github.io/splitpanes/ -->
        <Splitpanes ref="splitpanesRef" @resized="onSplitpanesResized">
            <Pane :size="leftPaneSize" min-size="10" max-size="50">
                <div class="favorite">
                    <Favorite />
                </div>
            </Pane>
            <Pane>
                <Explorer />
            </Pane>
        </Splitpanes>
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
    .favorite {
        background-color: #222;
        height: 100%;
    }
}
</style>
