<script setup lang="ts">
import { FolderFilled, FolderOpenFilled, FileFilled, RightOutlined } from '@ant-design/icons-vue';

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
            <div class="icon-left" v-if="item.isDir !== undefined">
                <folder-filled v-if="item.isDir && item.key !== selectedItemKey" />
                <folder-open-filled v-if="item.isDir && item.key === selectedItemKey" />
                <file-filled v-if="!item.isDir" />
            </div>
            <div class="item-name">{{ item.name }}</div>
            <div class="icon-right" v-if="item.isDir">
                <right-outlined />
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
@item-height: 24px;
.item-wrap {
    padding: 5px 10px;
    .item {
        border-radius: 5px;
        cursor: pointer;
        padding: 3px 5px;
        display: flex;
        .icon-left {
            height: @item-height;
            line-height: @item-height;
            font-size: 16px;
        }
        .item-name {
            flex-grow: 1;
            height: @item-height;
            line-height: @item-height;
            padding: 0 5px;
        }
        .icon-right {
            height: @item-height;
            line-height: @item-height;
        }
    }
    .item:hover {
        color: @item-hover-color;
    }
    .selected {
        background-color: @item-active-bg-color;
    }
}
</style>
