<script setup lang="ts">
// @ts-ignore
import { toggleTheme } from '@zougt/vite-plugin-theme-preprocessor/dist/browser-utils';
import { CircleClose, Sunny, Moon, VideoPlay, VideoPause, Warning, CopyDocument } from '@element-plus/icons-vue';
import { useDark, useToggle } from '@vueuse/core';
import { byteConvert, formatPercent } from '@/util/comm';

import { useThemeStore } from '@/store/ThemeStore';
import { useUploadStore, UploadStatus, UploadingFile } from '@/store/UploadStore';
import { useRemoteStore } from '@/store/RemoteStore';

// ****** 中央状态 ******
// 主题
let { isDark } = $(useThemeStore());
// 远端
let { curRemoteIndex, remotes } = $(useRemoteStore());
// 上传
let { uploadFiles, percent, getUploadingFile, startUpload, stopUpload, removeUploadFile, overwrite } =
    // 这个注释只为防止格式化会添加逗号
    $(useUploadStore());

// ****** 局部状态 ******
// 上传中的文件
let uploadingFile: UploadingFile | undefined = undefined;

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
        <el-tooltip content="文件上传">
            <div class="file-upload">
                <el-popover
                    v-if="uploadFiles.length > 0"
                    title="文件上传"
                    width="700"
                    placement="bottom-end"
                    trigger="click"
                >
                    <template #reference>
                        <el-progress class="upload-progress" type="circle" :percentage="percent" :width="40" />
                    </template>
                    <div class="upload-file" v-for="uploadFile in uploadFiles">
                        {{ void (uploadingFile = getUploadingFile(uploadFile.id)) }}
                        <el-icon class="upload-file-icon">
                            <UploadFileIcon />
                        </el-icon>
                        <div class="detail">
                            <div class="file-name">{{ uploadFile.name }}</div>
                            <el-progress
                                size="small"
                                :percentage="
                                    [UploadStatus.Success, UploadStatus.AskOverWrite].includes(uploadFile.status)
                                        ? 100
                                        : uploadingFile?.percent
                                "
                                :format="formatPercent"
                            />
                            <div class="file-status">
                                <span v-if="uploadFile.status === UploadStatus.Preparing">准备中</span>
                                <span v-else-if="uploadFile.status === UploadStatus.Ready">等待上传</span>
                                <span v-else-if="uploadFile.status === UploadStatus.Uploading">上传中</span>
                                <span v-else-if="uploadFile.status === UploadStatus.AskOverWrite" class="err">
                                    文件已存在，请在右边点击按钮选择重命名或覆盖
                                </span>
                                <span v-else-if="uploadFile.status === UploadStatus.Success">已完成</span>
                                <span v-else-if="uploadFile.status === UploadStatus.Stop">已停止</span>
                                <span v-else-if="uploadFile.status === UploadStatus.Fail" class="err">
                                    错误: {{ uploadFile.error }}
                                </span>
                                <span v-else class="err">未知状态</span>
                                <span>---- {{ byteConvert(uploadFile.size || 0) }}</span>
                            </div>
                        </div>
                        <el-tooltip
                            :content="
                                [UploadStatus.Stop, UploadStatus.Fail].includes(uploadFile.status)
                                    ? '启动'
                                    : [UploadStatus.Ready, UploadStatus.Uploading].includes(uploadFile.status)
                                    ? '停止'
                                    : UploadStatus.AskOverWrite === uploadFile.status
                                    ? '重命名'
                                    : '不能启动'
                            "
                        >
                            <div>
                                <el-icon
                                    v-if="[UploadStatus.Stop, UploadStatus.Fail].includes(uploadFile.status)"
                                    class="action-icon"
                                    @click="startUpload(uploadFile.id)"
                                >
                                    <VideoPlay />
                                </el-icon>
                                <el-popconfirm
                                    v-else-if="[UploadStatus.Ready, UploadStatus.Uploading].includes(uploadFile.status)"
                                    title="你确定要停止该文件的上传?"
                                    confirm-button-text="确定"
                                    cancel-button-text="取消"
                                    @confirm="stopUpload(uploadFile.id)"
                                >
                                    <template #reference>
                                        <el-icon class="action-icon">
                                            <VideoPause />
                                        </el-icon>
                                    </template>
                                </el-popconfirm>
                                <el-icon
                                    v-else-if="UploadStatus.AskOverWrite === uploadFile.status"
                                    class="action-icon rename-icon"
                                    @click="overwrite(uploadFile, false)"
                                >
                                    <CopyDocument />
                                </el-icon>
                                <el-icon v-else class="action-icon">
                                    <DisableStartIcon class="action-icon" />
                                </el-icon>
                            </div>
                        </el-tooltip>
                        <el-tooltip
                            :content="
                                uploadFile.status === UploadStatus.Success
                                    ? '清除记录'
                                    : uploadFile.status === UploadStatus.AskOverWrite
                                    ? '覆盖'
                                    : '取消上传'
                            "
                        >
                            <div>
                                <el-icon
                                    class="action-icon"
                                    v-if="uploadFile.status === UploadStatus.AskOverWrite"
                                    @click="overwrite(uploadFile, true)"
                                >
                                    <Warning />
                                </el-icon>
                                <el-popconfirm
                                    v-else
                                    title="你确定要取消该文件的上传?"
                                    confirm-button-text="确定"
                                    cancel-button-text="取消"
                                    @confirm="removeUploadFile(uploadFile.id)"
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
            </div>
        </el-tooltip>
        <el-tooltip content="切换主题">
            <div class="toggle-theme">
                <el-switch
                    inline-prompt
                    v-model="isDark"
                    active-text="暗黑"
                    inactive-text="明亮"
                    @change="toggleDark()"
                    :active-action-icon="Moon"
                    :inactive-action-icon="Sunny"
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
    .file-upload {
        display: flex;
        .upload-progress {
            display: flex;
            cursor: pointer;
            .el-progress__text {
                min-width: 40px;
            }
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
                color: $color-error;
            }
        }
    }
    .action-icon {
        cursor: pointer;
        color: $icon-color-base;
        font-size: 24px;
        padding: 10px 10px 0 0;
        &:hover {
            color: $icon-color-hover;
        }
    }
    .rename-icon {
        width: 23px;
    }
}
</style>
