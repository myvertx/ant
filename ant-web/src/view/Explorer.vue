<script setup lang="ts">
import { uploadUrl } from '@/env';
import { FileRa } from '@/ro/FileRa';
import { Ro } from '@/ro/Ro';
import { useColumnWidthStore } from '@/store/ColumnWidthStore';
import { usePathStore } from '@/store/PathStore';
import { useUploadStore } from '@/store/UploadStore';
import { UploadOutlined } from '@ant-design/icons-vue';
import { UploadChangeParam, UploadFile, message } from 'ant-design-vue';

/** 当前组件实例 */
const app = getCurrentInstance();
/** 全局属性 */
const globalProperties = app?.appContext.config.globalProperties;
/** HTTP请求对象 */
const request = globalProperties?.$request;

// ****** 中央状态 ******
// 收藏
let { columns, addPath, clearColumn, selectColumnFile } = $(usePathStore());
let { get: getColumnWidth, set: setColumnWidth } = $(useColumnWidthStore());
let { fileList, clearUpload, completeUpload } = $(useUploadStore());

/** 选择文件事件 */
function onSelect(item: { isDir: boolean; key: string }, columnKey: string) {
    const filePath = item.key;
    if (!item.isDir) {
        clearColumn(columnKey);
        selectColumnFile(columnKey, filePath);
        return;
    }

    // 发出get请求
    request
        ?.get({
            url: '/ant/file/list',
            params: { path: filePath },
        })
        // 处理返回的结果
        .then((ro: Ro) => {
            if (ro.result > 0) {
                clearColumn(columnKey);
                addPath(filePath, ro.extra as FileRa[]);
                selectColumnFile(columnKey, filePath);
            }
        });
}

/** 上传前 */
function beforeUpload(_file: UploadFile, newFileList: UploadFile[]) {
    return fileList.length + newFileList.length > 5 ? false : true;
}

/**
 * 上传状态改变
 */
function onUploadChange(info: UploadChangeParam) {
    console.log('onUploadChange', info);

    // 清理上传(在beforeUpload中禁止的上传仍然会加入列表中)
    clearUpload();

    if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
        completeUpload(info.file);
        message.success(`${info.file.name} 文件上传成功！`);
    } else if (info.file.status === 'error') {
        if (info.file.error?.status === 413) {
            message.error(`${info.file.name} 文件太大，禁止上传到服务器！`);
            return;
        }
        message.error(`${info.file.name} 文件上传失败！`);
    }
}
</script>

<template>
    <template v-for="column in columns">
        <a-dropdown :trigger="['contextmenu']">
            <div class="column" :style="{ flexBasis: getColumnWidth(column.path) || '200px' }">
                <SelectList
                    :componentKey="column.path"
                    :selectedItemKey="column.selectedFile"
                    :data="column.files"
                    @select="onSelect"
                />
            </div>
            <template #overlay>
                <a-menu>
                    <a-menu-item>
                        <a-upload
                            v-model:file-list="fileList"
                            directory
                            :data="{ abc: 'def' }"
                            :action="uploadUrl"
                            :showUploadList="false"
                            :beforeUpload="beforeUpload"
                            @change="onUploadChange"
                        >
                            <upload-outlined />&nbsp;&nbsp;上传文件夹
                        </a-upload>
                    </a-menu-item>
                    <a-menu-item>
                        <a-upload
                            v-model:file-list="fileList"
                            :data="{ abc: 'def' }"
                            multiple
                            :action="uploadUrl"
                            :showUploadList="false"
                            :beforeUpload="beforeUpload"
                            @change="onUploadChange"
                        >
                            <upload-outlined />&nbsp;&nbsp;上传文件
                        </a-upload>
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>
        <Splitter @resized="(size:string) => setColumnWidth(column.path, size)" />
    </template>
</template>

<style lang="less" scoped>
.column {
    /** 不缩小 */
    flex-shrink: 0;
    /** 不换行 */
    white-space: nowrap;
}
</style>
