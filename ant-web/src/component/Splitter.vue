<script setup lang="ts">
interface Props {
    /** 方向: 垂直、水平 */
    direction: 'vertical' | 'horizontal';
}
const { /** 方向默认垂直 */ direction = 'vertical' } = defineProps<Props>();
</script>

<template>
    <div
        class="splitter"
        v-bind:class="{ vertical: direction === 'vertical', horizontal: direction === 'horizontal' }"
    ></div>
</template>

<style lang="less" scoped>
.splitter {
    background-color: black;
}
/** 垂直 */
.vertical {
    width: 3px;
    height: 100%;
    cursor: col-resize;
}
/** 水平 */
.horizontal {
    height: 3px;
    width: 100%;
    cursor: row-resize;
}
</style>
