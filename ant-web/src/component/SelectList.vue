<script setup lang="ts">
export interface SelectListItem {
    key: string;
    name: string;
}
interface Props {
    selectedKey: string;
    data: SelectListItem[];
}
const { selectedKey, data } = defineProps<Props>();
const emit = defineEmits(['select']);
function onClick(item: SelectListItem) {
    emit('select', item);
}
</script>

<template>
    <div class="item-wrap" v-for="item in data" :key="item.key" @click="onClick(item)">
        <div class="item" v-bind:class="{ selected: item.key === selectedKey }">{{ item.name }}</div>
    </div>
</template>

<style lang="less" scoped>
.item-wrap {
    padding: 5px;
    .item {
        border-radius: 5px;
        cursor: pointer;
        padding: 3px 15px;
    }
    .item:hover {
        color: #fff;
    }
    .selected {
        background-color: #666;
    }
}
</style>
