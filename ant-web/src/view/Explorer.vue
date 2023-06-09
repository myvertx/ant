<script setup lang="ts">
import { maxUploadings, uploadUrl } from '@/env';
import { FileRa } from '@/ro/FileRa';
import { Ro } from '@/ro/Ro';
import { useColumnWidthStore } from '@/store/ColumnWidthStore';
import { Column, usePathStore } from '@/store/PathStore';
import { useUploadStore } from '@/store/UploadStore';
import { UploadOutlined } from '@ant-design/icons-vue';
import { UploadChangeParam, message } from 'ant-design-vue';
import { FileType } from 'ant-design-vue/lib/upload/interface';

/** 当前组件实例 */
const app = getCurrentInstance();
/** 全局属性 */
const globalProperties = app?.appContext.config.globalProperties;
/** HTTP请求对象 */
const request = globalProperties?.$request;

// ****** 中央状态 ******
// 收藏
let { columns, addPath, clearColumn, addFileInColumn, selectFileInColumn } = $(usePathStore());
let { get: getColumnWidth, set: setColumnWidth } = $(useColumnWidthStore());
let { fileList, cancelUpload } = $(useUploadStore());

/** 选择文件事件 */
function onSelect(item: { isDir: boolean; key: string }, columnKey: string) {
    const filePath = item.key;
    if (!item.isDir) {
        clearColumn(columnKey);
        selectFileInColumn(columnKey, filePath);
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
                selectFileInColumn(columnKey, filePath);
            }
        });
}

/** 上传data参数 */
function uploadData(file: FileType, column: Column) {
    console.log('uploadData', file);
    const fileNameWithDir = file.webkitRelativePath as string;
    let createDir = '';
    if (fileNameWithDir) {
        const index = fileNameWithDir.indexOf('/');
        if (index !== -1) {
            createDir = fileNameWithDir.substring(0, index);
        }
    }

    const data = {
        uid: file.uid,
        fileName: file.name,
        fileSize: file.size,
        lastModified: file.lastModified,
        fileDir: column.path,
        /** 上传后要创建的目录 */
        createDir,
    };
    return data;
}

/**
 * 上传状态改变
 */
function onUploadChange(info: UploadChangeParam) {
    if (info.file.status === 'uploading') {
        // 判断是否是因为超过上最大文件数不能上传
        if (info.file.percent === 0) {
            for (const file of info.fileList) {
                if (file.uid === info.file.uid) {
                    return;
                }
            }
            message.warn(`不能上传${info.file.name}文件，最多只能同时上传${maxUploadings}个文件`);
        }
    } else if (info.file.status === 'done') {
        console.log('onUploadChange', info);
        const file = info.file;
        cancelUpload(file);
        const fileNameWithDir = file.originFileObj?.webkitRelativePath as string;
        const ro = file.response.extra;
        if (fileNameWithDir) {
            const fileDir = ro.fileDir;
            let index = fileNameWithDir.indexOf('/');
            const dirName = fileNameWithDir.substring(0, index);
            index = fileDir.lastIndexOf('/');
            const columnPath = fileDir.substring(0, index);
            addFileInColumn(columnPath, { isDir: true, name: dirName, path: fileDir });
        } else {
            addFileInColumn(ro.fileDir, { isDir: false, name: ro.fileName, path: ro.fileFullPath });
        }
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
                            :data="(file:FileType) => uploadData(file, column)"
                            :maxCount="maxUploadings"
                            :action="uploadUrl"
                            :showUploadList="false"
                            @change="onUploadChange"
                        >
                            <span class="upload-dir"><upload-outlined />&nbsp;&nbsp;上传文件夹</span>
                        </a-upload>
                    </a-menu-item>
                    <a-menu-item>
                        <a-upload
                            multiple
                            v-model:file-list="fileList"
                            :data="(file:FileType) => uploadData(file, column)"
                            :maxCount="maxUploadings"
                            :action="uploadUrl"
                            :showUploadList="false"
                            @change="onUploadChange"
                        >
                            <span class="upload-file"><upload-outlined />&nbsp;&nbsp;上传文件</span>
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
.upload-dir {
    margin: -10px -10px;
    padding: 10px 10px;
}
.upload-file {
    margin: -10px -25px -10px -10px;
    padding: 10px 25px 10px 10px;
}
</style>

<style lang="less">
// .ant-dropdown-menu-item {
//     .ant-upload-select {
//         [role='button'] {
//             margin: 0 -20px;
//             padding: 0 20px;
//         }
//     }
// }
</style>
