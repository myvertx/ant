<script setup lang="ts">
import UploadFile from '@/component/UploadFile.vue';
import { FileMo } from '@/mo/FileMo';
import { Ro } from '@/ro/Ro';
import { useRemoteStore } from '@/store/RemoteStore';
import { fileSvc } from '@/svc/FileSvc';
import { Refresh, Upload } from '@element-plus/icons-vue';

// 上传组件
const uploadRef = $ref<InstanceType<typeof UploadFile>>() as unknown as typeof UploadFile;

// ****** 中央状态 ******
// 远端
const {
    columns,
    curColumnIndex,
    getPathColumnWidth,
    setPathColumnWidth,
    clearColumnsAfterCurColumn,
    setCurColumnIndex,
    selectFiles,
    selectDir,
    refreshCurColmn,
} =
    // 这里强制折行，否则格式化后会多一个逗号
    $(useRemoteStore());

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
</script>

<template>
    <v-contextmenu ref="contextmenu">
        <v-contextmenu-item @click="uploadRef.openDialog(true)">
            <el-icon><Upload /></el-icon><span>上传文件夹</span>
        </v-contextmenu-item>
        <v-contextmenu-item @click="uploadRef.openDialog(false)">
            <el-icon><Upload /></el-icon><span>上传文件</span>
        </v-contextmenu-item>
        <v-contextmenu-divider />
        <v-contextmenu-item @click="refreshCurColmn">
            <el-icon><Refresh /></el-icon><span>刷新当前列</span>
        </v-contextmenu-item>
    </v-contextmenu>

    <UploadFile ref="uploadRef" v-show="false" />

    <template v-for="(column, columnIndex) in columns">
        <div
            class="column"
            :class="{
                'column-actived': curColumnIndex == columnIndex,
            }"
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
}
.column-actived {
    background-color: $bg-color-actived;
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
</style>
