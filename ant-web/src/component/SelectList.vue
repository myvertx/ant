<script setup lang="ts">
import { RightOutlined } from '@ant-design/icons-vue';

interface SelectListItem {
    isDir: boolean;
    key: string;
    name: string;
}
interface Props {
    componentKey?: string;
    selectedItemKey?: string;
    data: SelectListItem[];
}
const { componentKey, selectedItemKey, data } = defineProps<Props>();
const emit = defineEmits(['select']);
function onClick(item: SelectListItem) {
    emit('select', item, componentKey);
}
</script>

<template>
    <div class="item-wrap" v-for="item in data" :key="item.key" @click="onClick(item)">
        <div class="item" v-bind:class="{ selected: item.key === selectedItemKey }">
            <div class="item-name">{{ item.name }}</div>
            <right-outlined v-if="item.isDir" />
        </div>
    </div>
</template>

<style lang="less" scoped>
.item-wrap {
    padding: 5px;
    .item {
        border-radius: 5px;
        cursor: pointer;
        padding: 3px 15px;
        display: flex;
        // justify-content: space-around;
        .item-name {
            flex-grow: 1;
        }
    }
    .item:hover {
        color: #fff;
    }
    .selected {
        background-color: #666;
    }
}
</style>
