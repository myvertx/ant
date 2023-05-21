<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
</script>

<template>
    <div class="header">
        <h1 class="title">MyVertx Ant</h1>
    </div>
    <div class="center">
        <!-- 分割面板 https://antoniandre.github.io/splitpanes/ -->
        <splitpanes>
            <pane size="10" min-size="10" max-size="50">
                <div class="favorite">
                    <Favorite />
                </div>
            </pane>
            <pane min-size="10">
                <Explorer />
            </pane>
        </splitpanes>
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
