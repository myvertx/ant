<script setup lang="ts">
import { useRemoteStore } from '@/store/RemoteStore';
import { useUploadStore } from '@/store/UploadStore';
import { UPLOAD_FILE_URI } from '@/uri/FileUri';

// ****** 中央状态 ******
// 远端
const { curRemote, curColumnPath } =
    // 这里强制折行，否则格式化后会多一个逗号
    $(useRemoteStore());
// 上传
let { runTasks, addTask } = $(useUploadStore());

// ****** 局部状态 ******
// file input dom
const fileInputRef = $shallowRef(null) as unknown as HTMLInputElement;

// ****** 属性 ******
interface Props {
    /** 上传的文件字段名 */
    name?: string;
    /** 是否支持多选文件 */
    multiple?: boolean;
}
// 响应式解构属性并设置默认值
const {
    // 上传的文件字段名默认为file
    name = 'file',
    // 默认支持多选文件
    multiple = true,
} = defineProps<Props>();

// ****** 方法 ******

// ****** 暴露方法 ******
/**
 * 打开上传对话框
 * @param isDir 上传的是否是目录(不是目录则是文件)
 */
function openDialog(isDir: boolean) {
    fileInputRef.webkitdirectory = isDir ? true : false;
    fileInputRef.click();
}
defineExpose({
    openDialog,
});

// ****** 事件 ******
/**
 * 打开对话框选择文件确认后触发的事件
 */
function onChange() {
    let files = fileInputRef.files as FileList;
    console.log(files);
    addTask(curRemote, curColumnPath, curRemote.basePath + UPLOAD_FILE_URI, files);
    // 清空上次上传的文件，否则如果再上传同一个文件就不会触发onChange事件
    fileInputRef.value = '';
}

// 定时运行任务
console.log('init runTasks');
runTasks();
</script>
<template>
    <input ref="fileInputRef" type="file" :name="name" :multiple="multiple" @change="onChange" />
</template>
