<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
</script>

<template>
    <div class="header">
        <h1 class="title">MyVertx Ant</h1>
    </div>
    <div class="center">
        <splitpanes>
            <pane size="10" min-size="10" max-size="50">
                <Favorite />
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
}
</style>

<style lang="less">
// .splitpanes {
//     background-color: #111;
//     // &__pane {
//     //     background-color: #111;
//     // }

//     &__splitter {
//         left: -30px;
//         right: -30px;
//     }
// }
.splitpanes {
    background-color: #111;
    &__splitter {
        background-color: black;
        position: relative;
    }
    &__splitter::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        transition: opacity 0.4s;
        background-color: rgba(255, 0, 0, 0.3);
        opacity: 0;
        z-index: 1;
    }
    &__splitter:hover:before {
        opacity: 1;
    }
    &--vertical > .splitpanes__splitter:before {
        left: -5px;
        right: -5px;
        height: 100%;
    }
    &--horizontal > .splitpanes__splitter:before {
        top: -5px;
        bottom: -5px;
        width: 100%;
    }
}
</style>
