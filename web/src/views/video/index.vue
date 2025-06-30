<template>
  <div class="view-container">
    <!-- 操作栏 -->
    <div class="view-header">
      <div>
        <el-input v-model="searchParams.videoName" placeholder="输入视频名称搜索" style="width: 300px; margin-right: 10px;" />
        <el-input v-model="searchParams.videoName2" placeholder="输入视频名称搜索" style="width: 300px; margin-right: 10px;" />
        <el-input v-model="searchParams.videoName3" placeholder="输入视频名称搜索" style="width: 300px; margin-right: 10px;" />
        <el-button type="primary" @click="fetchTableData">搜索</el-button>
      </div>
      <div>
        <el-button type="success" @click="showAddDialog">添加视频</el-button>
        <el-button type="danger">批量删除</el-button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="view-main">
      <el-table :data="tableData" border style="height:100%;width: 100%">
        <el-table-column prop="videoName" label="名称"></el-table-column>
        <el-table-column prop="actor" label="主演"></el-table-column>
        <el-table-column prop="shortDesc" label="简介"></el-table-column>
        <el-table-column prop="category" label="类型"></el-table-column>
        <el-table-column prop="releaseDate" label="上线日期"></el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="view-footer">
      <el-pagination layout="prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="currentPage"
        @current-change="handlePageChange" />
    </div>
  </div>

  <!-- 添加对话框 -->
  <el-dialog v-model="addDialogVisible" title="添加视频" :close-on-click-modal="false">
    <el-form :model="formData" label-width="100px" :rules="formRules" ref="formDataRef">
      <el-form-item label="名称" prop="videoName">
        <el-input v-model="formData.videoName" />
      </el-form-item>
      <el-form-item label="主演" prop="actor">
        <el-input v-model="formData.actor" />
      </el-form-item>
      <el-form-item label="简介" prop="shortDesc">
        <el-input v-model="formData.shortDesc" />
      </el-form-item>
      <el-form-item label="封面地址" prop="coverUrl">
        <el-input v-model="formData.coverUrl" style="width: 80%; float: left;" readonly />
        <input type="file" @change="handleCoverUpload" style="display: none;" ref="fileInput" />
        <el-button type="primary" @click="fileInput.click()" style="margin-left: 10px;">上传封面</el-button>
      </el-form-item>
      <el-form-item label="类型" prop="category">
        <el-input v-model="formData.shortDesc" />
      </el-form-item>
      <el-form-item label="上线日期" prop="releaseDate">
        <el-input v-model="formData.shortDesc" />
      </el-form-item>
      <el-form-item>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(formDataRef)">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { addVideo, getVideoList, upload } from "@/api/video"
import { useTable } from "./useTable";
import { useForm } from "./useForm";


const {
  tableData,
  searchParams,
  currentPage,
  pageSize,
  total,
  fetchTableData,
  handlePageChange
} = useTable();

const {
  formData,
  formRules,
  formDataRef,
  addDialogVisible,
  showAddDialog,
  submitForm,
  handleCoverUpload,
  fileInput
} = useForm(fetchTableData);

// 初始化加载数据
onMounted(() => {
  fetchTableData();
});

</script>
<style scoped></style>