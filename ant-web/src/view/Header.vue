<script setup lang="ts">
// @ts-ignore
import { toggleTheme } from '@zougt/vite-plugin-theme-preprocessor/dist/browser-utils';
import { CircleClose } from '@element-plus/icons-vue';
import { useDark, useToggle } from '@vueuse/core';
import { byteConvert, formatPercent } from '@/util/comm';

import { useThemeStore } from '@/store/ThemeStore';
import { useUploadStore } from '@/store/UploadStore';
import { useRemoteStore } from '@/store/RemoteStore';

// ****** 中央状态 ******
// 主题
let { isDark } = $(useThemeStore());
// 远端
let { curRemoteIndex, remotes } = $(useRemoteStore());
// 上传
let { uploadFiles, percent, cancelUpload } = $(useUploadStore());

watch(useDark(), (newValue) => {
    isDark = newValue;
    toggleTheme({ scopeName: isDark ? 'dark' : 'default' });
});
const toggleDark = useToggle(useDark());
</script>

<template>
    <div class="header">
        <h1 class="title">MyVertx Ant</h1>
        <div class="content">
            <el-radio-group v-model="curRemoteIndex" button-style="solid">
                <el-radio-button v-for="(remote, index) in remotes" :label="index">
                    {{ remote.name }}
                </el-radio-button>
            </el-radio-group>
        </div>
        <el-popover title="文件上传进度" width="500" v-if="uploadFiles.length > 0" placement="bottom-end">
            <template #reference>
                <el-progress class="upload-progress" type="circle" :percentage="percent" :width="40" />
            </template>
            <div class="upload-file" v-for="uploadFile in uploadFiles">
                <UploadFileIcon class="upload-file-icon" />
                <div class="detail">
                    <div class="file-name">{{ uploadFile.file.name }}</div>
                    <el-progress size="small" :percentage="uploadFile.percent" :format="formatPercent" />
                    <div class="file-status">
                        <span v-if="uploadFile.status === 'ready'">准备中</span>
                        <span v-else-if="uploadFile.status === 'uploading'">上传中</span>
                        <span v-else-if="uploadFile.status === 'success'">已完成</span>
                        <span v-else-if="uploadFile.status === 'fail'" class="err">
                            错误: {{ uploadFile.error.status === 413 ? '文件太大，禁止上传到服务器！' : '未知错误' }}
                        </span>
                        <span v-else class="err">未知状态</span>
                        <span>---- {{ byteConvert(uploadFile.size || 0) }}</span>
                    </div>
                </div>
                <el-tooltip content="取消上传" v-if="uploadFile.status !== 'success' && uploadFile.status !== 'fail'">
                    <div>
                        <el-popconfirm
                            title="你是否要取消该文件的上传?"
                            confirm-button-text="是"
                            cancel-button-text="否"
                            @confirm="cancelUpload(uploadFile)"
                        >
                            <template #reference>
                                <el-icon class="action-icon">
                                    <CircleClose />
                                </el-icon>
                            </template>
                        </el-popconfirm>
                    </div>
                </el-tooltip>
                <el-tooltip content="取消上传" v-if="uploadFile.status !== 'success' && uploadFile.status !== 'fail'">
                    <div>
                        <el-popconfirm
                            title="你是否要取消该文件的上传?"
                            confirm-button-text="是"
                            cancel-button-text="否"
                            @confirm="cancelUpload(uploadFile)"
                        >
                            <template #reference>
                                <el-icon class="action-icon">
                                    <CircleClose />
                                </el-icon>
                            </template>
                        </el-popconfirm>
                    </div>
                </el-tooltip>
            </div>
        </el-popover>
        <el-tooltip content="切换主题">
            <div class="toggle-theme">
                <el-switch
                    inline-prompt
                    v-model="isDark"
                    active-text="暗黑"
                    inactive-text="普通"
                    @change="toggleDark()"
                />
            </div>
        </el-tooltip>
    </div>
</template>
<style lang="scss" scoped>
$header-height: 60px;
.header {
    display: flex;
    height: $header-height;
    background-color: $bg-color-title;
    .title {
        line-height: $header-height;
        padding: 0 20px;
    }
    .content {
        display: flex;
        padding: 0 20px;
        flex-grow: 1;
    }
    .upload-progress {
        display: flex;
        cursor: pointer;
        .el-progress__text {
            min-width: 40px;
        }
    }
    .toggle-theme {
        line-height: $header-height;
        padding: 0 20px;
    }
}
.upload-file {
    // width: 100%;
    padding: 20px 10px 20px 15px;
    display: flex;
    .upload-file-icon {
        padding: 5px 10px 0;
        font-size: 36px;
    }
    .detail {
        flex-grow: 1;
        padding-right: 20px;
        .file-name {
            font-size: 14px;
            margin-bottom: -4px;
        }
        .file-status {
            font-size: 10px;
            margin-top: -2px;
            .err {
                @debug $color-error;
                color: $color-error;
            }
        }
    }
    .action-icon {
        cursor: pointer;
        color: $icon-color-base;
        font-size: 24px;
        padding-top: 8px;
        &:hover {
            color: $icon-color-hover;
        }
    }
}
</style>
