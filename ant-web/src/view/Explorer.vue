<script setup lang="ts">
import { maxUploadings } from '@/env';
import { ColumnMo } from '@/mo/ColumnMo';
import { FileMo } from '@/mo/FileMo';
import { Ro } from '@/ro/Ro';
import { useRemoteStore } from '@/store/RemoteStore';
import { useUploadStore } from '@/store/UploadStore';
import { fileSvc } from '@/svc/FileSvc';
import { UPLOAD_FILE_URI } from '@/uri/FileUri';
import { UploadOutlined } from '@ant-design/icons-vue';
import { UploadChangeParam, message } from 'ant-design-vue';
import { FileType } from 'ant-design-vue/lib/upload/interface';

// ****** 中央状态 ******
// 远端
const {
    curRemote,
    columns,
    getPathColumnWidth,
    setPathColumnWidth,
    clearColumnsAfterCurColumn,
    setCurColumnIndex,
    selectFiles,
    selectDir,
    addFileInColumn,
} =
    // 这里强制折行，否则格式化后会多一个逗号
    $(useRemoteStore());
let { fileList, cancelUpload } = $(useUploadStore());

/**
 * 选择文件事件
 * @param file 选择的文件
 * @param fileIndex 选择的文件索引
 * @param columnIndex 点击的列索引
 */
function onSelect(file: FileMo, fileIndex: number, columnIndex: number) {
    // 设置当前列索引
    setCurColumnIndex(columnIndex);
    // 清空当前列之后的所有列
    clearColumnsAfterCurColumn();
    // 如果文件不是目录，选择文件
    if (!file.isDir) {
        selectFiles([fileIndex]);
        return;
    }
    // 如果文件是目录，选择目录
    fileSvc
        .list(file.path)
        // 处理返回的结果
        .then((ro: Ro) => {
            if (ro.result > 0) {
                selectDir(fileIndex, ro.extra as FileMo[]);
            }
        });
}

/** 上传data参数 */
function uploadData(file: FileType, column: ColumnMo) {
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
    <template v-for="(column, columnIndex) in columns">
        <a-dropdown :trigger="['contextmenu']">
            <div class="column" :style="{ flexBasis: getPathColumnWidth(column.path) }">
                <SelectList
                    :selectedItemIndices="column.selectedFileIndices"
                    :data="column.files"
                    @select="(file: FileMo, fileIndex:number) => onSelect(file, fileIndex, columnIndex)"
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
                            :action="curRemote.basePath + UPLOAD_FILE_URI"
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
                            :action="curRemote.basePath + UPLOAD_FILE_URI"
                            :showUploadList="false"
                            @change="onUploadChange"
                        >
                            <span class="upload-file"><upload-outlined />&nbsp;&nbsp;上传文件</span>
                        </a-upload>
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>
        <Splitter @resized="(size:string) => setPathColumnWidth(column.path, size)" />
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
