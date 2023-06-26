<script setup lang="ts">
import { FileFilled, FolderFilled, FolderOpenFilled, RightOutlined } from '@ant-design/icons-vue';

interface Item {
    /** 是否目录 */
    isDir?: boolean;
    /** 项目的名称(用于在列中显示) */
    name: string;
}
interface Props {
    /** 选择项目的索引列表 */
    selectedItemIndices?: number[];
    data: Item[];
}
const { selectedItemIndices, data } = defineProps<Props>();
const emit = defineEmits(['select']);
/**
 * 鼠标点击项目事件
 * @param item 点击的项目
 * @param index 项目的索引
 */
function onClick(item: Item, index: number) {
    emit('select', item, index);
}
</script>

<template>
    <div>
        <div class="item-wrap" v-for="(item, index) in data" @click="onClick(item, index)">
            <div
                class="item"
                v-bind:class="{ selected: selectedItemIndices && selectedItemIndices.indexOf(index) > -1 }"
            >
                <div class="icon-left" v-if="item.isDir !== undefined">
                    <folder-open-filled
                        v-if="item.isDir && selectedItemIndices?.length === 1 && selectedItemIndices[0] === index"
                    />
                    <folder-filled v-else-if="item.isDir" />
                    <file-filled v-else />
                </div>
                <div class="item-name">{{ item.name }}</div>
                <div class="icon-right" v-if="item.isDir">
                    <right-outlined />
                </div>
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
