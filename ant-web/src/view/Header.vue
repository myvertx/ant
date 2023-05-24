<script setup lang="ts">
// @ts-ignore
import { toggleTheme } from '@zougt/vite-plugin-theme-preprocessor/dist/browser-utils';
import { CloseCircleOutlined } from '@ant-design/icons-vue';

import { useThemeStore } from '@/store/ThemeStore';
import { useUploadStore } from '@/store/UploadStore';
import { byteConvert } from '@/util/comm';

// ****** 中央状态 ******
// 收藏
const themeStore = useThemeStore();
let { curTheme } = $(themeStore);
let { fileList, percent, cancelUpload } = $(useUploadStore());

onMounted(() => {
    toggleTheme({ scopeName: curTheme });
});

/** 格式化百分比 */
function formatPercent(percent: number) {
    console.log('percent', percent, percent.toFixed(2) + '%');
    return percent.toFixed(2) + '%';
}
</script>

<template>
    <div class="header">
        <h1 class="title">MyVertx Ant</h1>
        <a-popover v-if="fileList.length > 0" placement="bottomRight" trigger="click">
            <template #title>
                <span class="upload-title">文件上传进度</span>
            </template>
            <template #content>
                <div class="upload-file" v-for="file in fileList">
                    <UploadFileIcon class="upload-file-icon" />
                    <div class="detail">
                        <div class="file-name">{{ file.name }}</div>
                        <a-progress size="small" :percent="file.percent" :format="formatPercent" />
                        <div class="file-status">
                            {{
                                file.status === 'uploading'
                                    ? '上传中'
                                    : file.status === 'done'
                                    ? '已完成'
                                    : file.status === 'error'
                                    ? '错误'
                                    : file.status === 'removed'
                                    ? '已删除'
                                    : '未知状态'
                            }}
                            ---- {{ byteConvert(file.size || 0) }}
                        </div>
                    </div>
                    <!-- <a-tooltip>
                        <template #title>继续上传</template>
                        <PlayCircleOutlined class="action-icon" v-if="file.status === 'error'" />
                    </a-tooltip>
                    <a-tooltip>
                        <template #title>暂停上传</template>
                        <PauseCircleOutlined class="action-icon" v-if="file.status === 'uploading'" />
                    </a-tooltip>
                    <a-tooltip>
                        <template #title>已完成</template>
                        <CheckCircleOutlined class="action-icon" v-if="file.status === 'done'" />
                    </a-tooltip> -->
                    <a-tooltip>
                        <template #title>取消上传</template>
                        <a-popconfirm
                            title="你是否要取消该文件的上传?"
                            ok-text="是"
                            cancel-text="否"
                            @confirm="cancelUpload(file)"
                        >
                            <CloseCircleOutlined class="action-icon" v-if="file.status !== 'done'" />
                        </a-popconfirm>
                    </a-tooltip>
                </div>
            </template>
            <a-tooltip>
                <template #title>文件上传进度</template>
                <a-progress type="circle" :percent="percent" :width="30" />
            </a-tooltip>
        </a-popover>
        <a-tooltip>
            <template #title>切换主题</template>
            <div class="toggle-theme">
                <a-switch
                    v-model:checked="curTheme"
                    checked-value="dark"
                    checked-children="暗黑"
                    un-checked-value="default"
                    un-checked-children="普通"
                    @change="toggleTheme({ scopeName: curTheme })"
                />
            </div>
        </a-tooltip>
    </div>
</template>
<style lang="less" scoped>
@header-height: 60px;
.header {
    display: flex;
    height: @header-height;
    background-color: @background-color-heaviest;
    .title {
        line-height: @header-height;
        margin: 0;
        padding: 0 20px;
        flex-grow: 1;
    }
    .ant-progress {
        line-height: @header-height;
        cursor: pointer;
    }
    .toggle-theme {
        line-height: @header-height;
        padding: 0 20px;
    }
}
.upload-title {
    padding: 0 20px;
}
.upload-file {
    width: 500px;
    padding: 10px 5px;
    display: flex;
    .anticon {
        padding: 0 10px;
        line-height: 55px;
    }
    .upload-file-icon {
        font-size: 36px;
    }
    .detail {
        flex-grow: 1;
        padding-right: 30px;
        .file-name {
            font-size: 14px;
            margin-bottom: -7px;
        }
        .file-status {
            font-size: 10px;
            margin-top: -5px;
        }
    }
    .action-icon {
        font-size: 24px;
        cursor: pointer;
        &:hover {
            color: @icon-color-hover;
        }
    }
}
</style>
