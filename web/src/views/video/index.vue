<template>
  <div class="view-container">
    <!-- 操作栏 -->
    <div class="view-header">
      <div>
        <el-input v-model="searchParams.videoName" placeholder="输入视频名称搜索" style="width: 300px; margin-right: 10px;" />
        <el-input v-model="searchParams.actor" placeholder="输入视频名称搜索" style="width: 300px; margin-right: 10px;" />
        <el-input v-model="searchParams.category" placeholder="输入视频名称搜索" style="width: 300px; margin-right: 10px;" />
        <el-button type="primary" @click="fetchData">搜索</el-button>
      </div>
      <div>
        <el-button type="success" @click="showDialog">添加视频</el-button>
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="view-main">
      <el-table :data="tableData" @selection-change="handleSelectionChange" border style="height:100%;width: 100%">
        <el-table-column type="selection" :selectable="selectable" width="55" />
        <el-table-column prop="videoName" label="名称"></el-table-column>
        <el-table-column prop="actor" label="主演"></el-table-column>
        <el-table-column prop="shortDesc" label="简介"></el-table-column>
        <el-table-column prop="category" label="类型"></el-table-column>
        <el-table-column prop="releaseDate" label="上线日期"></el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleRemove(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="view-footer">
      <el-pagination layout="prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="currentPage"
        @current-change="handlePageChange" />
    </div>
  </div>

  <!-- 添加对话框 -->
  <el-dialog v-model="addDialogVisible" title="添加视频" :close-on-click-modal="false" @close="closeDialog">
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
      <el-form-item label="封面" prop="coverUrl">
        <el-upload action="" :limit="1" list-type="picture-card" accept=".pdf,.gif,.jpg,.png" :on-change="fileChange"
          :auto-upload="false" v-model:file-list="fileList">
          <el-icon>
            <Plus />
          </el-icon>

          <template #file="{ file }">
            <div>
              <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
              <span class="el-upload-list__item-actions">
                <span class="el-upload-list__item-delete" @click="removeFile(file)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </span>
              </span>
            </div>
          </template>
        </el-upload>
      </el-form-item>
      <el-form-item label="类型" prop="category">
        <el-input v-model="formData.category" />
      </el-form-item>
      <el-form-item label="上线日期" prop="releaseDate">
        <el-date-picker v-model="formData.releaseDate" type="date" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm(formDataRef)">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useTable } from "./useTable";
import { useForm } from "./useForm";
import { Delete, Plus } from '@element-plus/icons-vue'
import { removeVideo, removeVideos } from "@/api/video";
import { ElMessage, ElMessageBox } from 'element-plus';


const {
  tableData,
  searchParams,
  currentPage,
  pageSize,
  total,
  fetchData,
  handlePageChange
} = useTable();

const {
  formData,
  formRules,
  formDataRef,
  addDialogVisible,
  showDialog,
  submitForm,
  closeDialog,
  fileList,
  fileChange
} = useForm(fetchData);

const selectable = (row: any) => ![1, 2].includes(row.id)

const handleEdit = (row: any) => {
  if (row.coverUrl) {
    const files = row.coverUrl.split(';')
    files.forEach((file: any) => {
      fileList.value.push({ name: file, url: import.meta.env.VITE_BASE_URL + file })
    })
  }
  formData.value = { ...row }
  showDialog(true)
}
const multipleSelection = ref([])
const handleSelectionChange = (val: []) => {
  multipleSelection.value = val
}

const handleRemove = (row: any) => {
  ElMessageBox.confirm(
    '确认删除吗?',
    '提示！',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      await removeVideo(row.id)
      fetchData()
      ElMessage.success("删除成功！")
    })

}

const batchDelete = () => {
  console.log(multipleSelection);
  if (multipleSelection.value.length === 0) return ElMessage.warning("请选择要删除的项")

  ElMessageBox.confirm(
    '确认删除吗?',
    '提示！',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const ids = multipleSelection.value.map((item: any) => item.id)
      await removeVideos({ ids })
      fetchData()
      ElMessage.success("删除成功！")
    })

}

const removeFile = (file: any) => {
  fileList.value = fileList.value.filter((item: any) => item.name !== file.name)
}

// 初始化加载数据
onMounted(() => {
  fetchData();
});

</script>
<style scoped></style>