<script setup lang="ts">
import { maxUploadings } from '@/env';
import { ColumnMo } from '@/mo/ColumnMo';
import { FileMo } from '@/mo/FileMo';
import { Ro } from '@/ro/Ro';
import { useRemoteStore } from '@/store/RemoteStore';
import { useUploadStore } from '@/store/UploadStore';
import { fileSvc } from '@/svc/FileSvc';
import { UPLOAD_FILE_URI } from '@/uri/FileUri';
import { Upload } from '@element-plus/icons-vue';
import UploadFile from '@/component/UploadFile.vue';
// import { UploadChangeParam, message } from 'ant-design-vue';
// import { FileType } from 'ant-design-vue/lib/upload/interface';
import { ArrowDown, Check, CircleCheck, CirclePlus, CirclePlusFilled, Plus } from '@element-plus/icons-vue';
import { InputInstance, UploadUserFile } from 'element-plus';
// import message from 'element-plus/es/components/message/index.js';
// import { column } from 'element-plus/es/components/table-v2/src/common.js';

// 上传组件
const uploadRef = $ref<InstanceType<typeof UploadFile>>() as unknown as typeof UploadFile;

// ****** 中央状态 ******
// 远端
const {
    curRemote,
    columns,
    curColumn,
    // curColumnPath,
    curColumnIndex,
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
// 上传
// let { fileList, cancelUpload } = $(useUploadStore());

// ****** 局部状态 ******
// 要上传的文件列表
// let uploadFileList = reactive<UploadUserFile[]>([]); // 状态如果是数组或对象，用 reactive 方法创建

/**
 * 选择文件事件
 * @param file 选择的文件
 * @param fileIndex 选择的文件索引
 */
function onSelect(file: FileMo, fileIndex: number) {
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

// /**
//  * 显示上传对话框
//  * @param isDir 上传的是否是目录(不是目录则是文件)
//  */
// function showUploadDialog(isDir: boolean) {
//     isUploadDir = isDir;
//     console.log(fileInputRef);

//     const fileInput = fileInputRef.value as unknown as HTMLInputElement;

//     nextTick(() => {
//         fileInput.webkitdirectory = isDir ? true : false;
//         fileInput.click();
//     });
// }

/** 上传data参数 */
// function uploadData(): Record<string, any> {
//     console.log('uploadFileList', uploadFileList);
//     const data = {
//         fileDir: curColumnPath,
//         uploadFileList,
//     };
//     console.log('data', data);
//     return data;
//     // const fileNameWithDir = file.webkitRelativePath as string;
//     // let createDir = '';
//     // if (fileNameWithDir) {
//     //     const index = fileNameWithDir.indexOf('/');
//     //     if (index !== -1) {
//     //         createDir = fileNameWithDir.substring(0, index);
//     //     }
//     // }

//     // const data = {
//     //     uid: file.uid,
//     //     fileName: file.name,
//     //     fileSize: file.size,
//     //     lastModified: file.lastModified,
//     //     fileDir: column.path,
//     //     /** 上传后要创建的目录 */
//     //     createDir,
//     // };
//     // return data;
// }

// /**
//  * 上传状态改变
//  */
// function onUploadChange() {
//     const fileInput = fileInputRef.value as unknown as HTMLInputElement;
//     const files = fileInput.files as FileList;
//     console.log(files);
//     for (const file of files) {
//     }
// }

/**
 * 上传状态改变
 */
// function onUploadChange1(info: UploadChangeParam) {
//     if (info.file.status === 'uploading') {
//         // 判断是否是因为超过最大文件数不能上传
//         if (info.file.percent === 0) {
//             for (const file of info.fileList) {
//                 if (file.uid === info.file.uid) {
//                     return;
//                 }
//             }
//             message.warn(`不能上传${info.file.name}文件，最多只能同时上传${maxUploadings}个文件`);
//         }
//     } else if (info.file.status === 'done') {
//         console.log('onUploadChange', info);
//         const file = info.file;
//         cancelUpload(file);
//         const fileNameWithDir = file.originFileObj?.webkitRelativePath as string;
//         const ro = file.response.extra;
//         if (fileNameWithDir) {
//             const fileDir = ro.fileDir;
//             let index = fileNameWithDir.indexOf('/');
//             const dirName = fileNameWithDir.substring(0, index);
//             index = fileDir.lastIndexOf('/');
//             const columnPath = fileDir.substring(0, index);
//             addFileInColumn(columnPath, { isDir: true, name: dirName, path: fileDir });
//         } else {
//             addFileInColumn(ro.fileDir, { isDir: false, name: ro.fileName, path: ro.fileFullPath });
//         }
//         message.success(`${info.file.name} 文件上传成功！`);
//     } else if (info.file.status === 'error') {
//         if (info.file.error?.status === 413) {
//             message.error(`${info.file.name} 文件太大，禁止上传到服务器！`);
//             return;
//         }
//         message.error(`${info.file.name} 文件上传失败！`);
//     }
// }
</script>

<template>
    <v-contextmenu ref="contextmenu">
        <v-contextmenu-item @click="uploadRef.openDialog(true)">
            <el-icon><Upload /></el-icon><span>上传文件夹</span>
        </v-contextmenu-item>
        <v-contextmenu-item @click="uploadRef.openDialog(false)">
            <el-icon><Upload /></el-icon><span>上传文件</span>
        </v-contextmenu-item>
    </v-contextmenu>

    <!-- <el-dialog v-model="uploadDialogVisible" :title="'上传' + (isUploadDir ? '文件夹' : '文件')">
        <el-upload
            drag
            multiple
            :limit="maxUploadings"
            v-model:file-list="uploadFileList"
            :data="uploadData()"
            :action="curRemote.basePath + UPLOAD_FILE_URI"
        >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
            <template #tip>
                <div class="el-upload__tip">上传服务器路径: {{ curColumnPath }}</div>
            </template>
        </el-upload>
    </el-dialog> -->

    <UploadFile ref="uploadRef" v-show="false" />

    <template v-for="(column, columnIndex) in columns">
        <div
            class="column"
            :style="{ flexBasis: getPathColumnWidth(column.path) }"
            v-contextmenu:contextmenu
            @mouseup.native="setCurColumnIndex(columnIndex)"
        >
            <SelectList
                :isActived="curColumnIndex == columnIndex"
                :selectedItemIndices="column.selectedFileIndices"
                :data="column.files"
                @select="(file: FileMo, fileIndex:number) => onSelect(file, fileIndex)"
            />
            <!-- <el-dropdown trigger="contextmenu">
                <SelectList
                    :selectedItemIndices="column.selectedFileIndices"
                    :data="column.files"
                    @select="(file: FileMo, fileIndex:number) => onSelect(file, fileIndex, columnIndex)"
                />
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item :icon="Upload" command="uploadFolder"
                            >上传文件夹 -->
            <!-- <el-upload
                            v-model:file-list="fileList"
                            directory
                            :data="(file:FileType) => uploadData(file, column)"
                            :maxCount="maxUploadings"
                            :action="curRemote.basePath + UPLOAD_FILE_URI"
                            :show-file-list="false"
                            @change="onUploadChange"
                            >
                            <span class="upload-dir">
                                <el-icon><Upload /></el-icon>
                                &nbsp;&nbsp;上传文件夹
                            </span>
                        </el-upload> -->
            <!-- </el-dropdown-item>
                        <el-dropdown-item :icon="Upload" command="uploadFile"
                            >上传文件 -->
            <!-- <el-upload
                            multiple
                            v-model:file-list="fileList"
                            :data="(file:FileType) => uploadData(file, column)"
                            :maxCount="maxUploadings"
                            :action="curRemote.basePath + UPLOAD_FILE_URI"
                            :show-file-list="false"
                            @change="onUploadChange"
                        >
                        <span class="upload-file">
                            <el-icon><Upload /></el-icon>
                            &nbsp;&nbsp;上传文件
                        </span>
                    </el-upload> -->
            <!-- </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown> -->
        </div>
        <Splitter @resized="(size:string) => setPathColumnWidth(column.path, size)" />
    </template>
</template>

<style lang="scss" scoped>
.column {
    /** 不缩小 */
    flex-shrink: 0;
    /** 不换行 */
    white-space: nowrap;
    // .el-dropdown {
    //     width: 100%;
    //     // height: 100%;
    //     .el-tooltip__trigger {
    //         width: 100%;
    //     }
    // }
}
.v-contextmenu {
    .v-contextmenu-item {
        display: flex;
        padding: 5px 14px;
    }
    .el-icon {
        padding: 5px 0 5px 14px;
    }
    span {
        padding: 5px 14px 5px 5px;
    }
}
// .upload-dir {
//     margin: -10px -10px;
//     padding: 10px 10px;
// }
// .upload-file {
//     margin: -10px -25px -10px -10px;
//     padding: 10px 25px 10px 10px;
// }
//
</style>
