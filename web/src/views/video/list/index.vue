<template>
  <div class="view-container">
    <!-- 操作栏 -->
    <div class="view-header">
      <div style="display: flex; gap: 10px;">
        <el-input v-model="searchParams.videoName" placeholder="输入视频名称搜索" />
        <el-select v-model="searchParams.actor" clearable filterable allow-create default-first-option
          :reserve-keyword="false" placeholder="请选择主演">
          <el-option v-for="item in actorOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="searchParams.videoType" placeholder="请选择类型" clearable>
          <el-option label="无码" value="无码" />
          <el-option label="有码" value="有码" />
          <el-option label="AI破解" value="AI破解" />
        </el-select>
        <el-select v-model="searchParams.resolution" placeholder="请选择分辨率" clearable>
          <el-option label="720p" value="720p" />
          <el-option label="1080p" value="1080p" />
          <el-option label="2k" value="2k" />
          <el-option label="4k" value="4k" />
        </el-select>
        <el-select v-model="searchParams.subtitle" placeholder="请选择字幕类型" clearable>
          <el-option label="无字幕" value="无字幕" />
          <el-option label="外挂字幕" value="外挂字幕" />
          <el-option label="内嵌字幕" value="内嵌字幕" />
          <el-option label="字幕不准" value="字幕不准" />
        </el-select>
        <div style="flex: 0 0 160px; display: flex; align-items: center; justify-content: space-between;">
          <el-button style="flex:1" type="success" @click="">重置</el-button>
          <el-button style="flex:1" type="primary" @click="fetchData">搜索</el-button>
        </div>
      </div>
      <div>
        <el-button type="primary" @click="showDialog">添加视频</el-button>
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
        <el-button type="warning" @click="batchAdd">批量添加</el-button>
        <el-button type="success" @click="downloadDoc">下载文档</el-button>
        <el-button type="success" @click="downloadAllDoc">下载全部资源</el-button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="view-main">
      <el-table :data="tableData" @selection-change="handleSelectionChange" border style="height:100%;width: 100%">
        <el-table-column type="selection" :selectable="selectable" width="55" />
        <el-table-column fixed prop="videoName" label="名称" width="120"></el-table-column>
        <el-table-column prop="releaseDate" label="发行日期" width="140"></el-table-column>
        <el-table-column prop="actor" label="主演" width="240"></el-table-column>
        <el-table-column prop="shortDesc" label="简介"></el-table-column>
        <el-table-column prop="series" label="系列" width="280"></el-table-column>

        <el-table-column width="200">
          <template #header>
            <span>更多</span>
          </template>
          <template #default="scope">
            <div style="display: flex; gap: 5px;">
              <el-tag type="success" size="small" round v-if="scope.row.resolution != '1080p'">
                {{ scope.row.resolution }}
              </el-tag>
              <el-tag type="info" size="small" round v-else>
                {{ scope.row.resolution }}
              </el-tag>
              <el-tag type="success" size="small" round v-if="scope.row.videoType != '有码'">
                {{ scope.row.videoType }}
              </el-tag>
              <el-tag type="info" size="small" round v-else>
                {{ scope.row.videoType }}
              </el-tag>
              <el-tag type="danger" size="small" round v-if="scope.row.subtitle != '外挂字幕'">
                {{ scope.row.subtitle }}
              </el-tag>
              <el-tag type="info" size="small" round v-else>
                {{ scope.row.subtitle }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
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
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
        v-model:current-page="currentPage" @current-change="handlePageChange" />
    </div>
  </div>

  <!-- 添加对话框 -->
  <el-dialog v-model="addDialogVisible" title="添加视频" :close-on-click-modal="false" @close="closeDialog" align-center>
    <el-form :model="formData" label-width="100px" :rules="formRules" ref="formDataRef">
      <el-form-item label="名称" prop="videoName">
        <el-input v-model="formData.videoName" />
      </el-form-item>
      <el-form-item label="主演" prop="actorList">
        <!-- <el-input v-model="formData.actor" /> -->
        <el-select v-model="formData.actorList" multiple clearable filterable allow-create default-first-option
          :reserve-keyword="false" placeholder="请选择主演">
          <el-option v-for="item in actorOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="简介" prop="shortDesc">
        <el-input v-model="formData.shortDesc" />
      </el-form-item>

      <el-form-item label="封面">
        <div style="width: 100%;">
          <div style="display: flex; align-items: center; gap: 10px;margin-bottom: 10px;">
            <el-input placeholder="输入图片链接上传" v-model="formData.imageUrl" style="width: 100%;"></el-input>
            <el-button type="success" @click="submitForm(formDataRef, 'imageUpload')">上 传</el-button>
          </div>
          <el-upload action="" :limit="1" list-type="picture-card" accept=".pdf,.gif,.jpg,.png" :on-change="fileChange"
            :auto-upload="false" v-model:file-list="fileList" :disabled="fileList.length > 0">
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
        </div>
      </el-form-item>
      <el-form-item label="发行日期" prop="releaseDate">
        <el-date-picker v-model="formData.releaseDate" type="date" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="系列" prop="series">
        <el-input v-model="formData.series" />
      </el-form-item>
      <el-form-item label="类型" prop="videoType">
        <el-select v-model="formData.videoType" placeholder="请选择类型">
          <el-option label="无码" value="无码" />
          <el-option label="有码" value="有码" />
          <el-option label="AI破解" value="AI破解" />
        </el-select>
      </el-form-item>
      <el-form-item label="分辨率" prop="resolution">
        <el-select v-model="formData.resolution" placeholder="请选择分辨率">
          <el-option label="720p" value="720p" />
          <el-option label="1080p" value="1080p" />
          <el-option label="2k" value="2k" />
          <el-option label="4k" value="4k" />
        </el-select>
      </el-form-item>
      <el-form-item label="字幕" prop="subtitle">
        <el-select v-model="formData.subtitle" placeholder="请选择字幕类型">
          <el-option label="无字幕" value="无字幕" />
          <el-option label="外挂字幕" value="外挂字幕" />
          <el-option label="内嵌字幕" value="内嵌字幕" />
          <el-option label="字幕不准" value="字幕不准" />
        </el-select>
      </el-form-item>
      <el-form-item label-width="0">
        <div style="width: 100%;display: flex;justify-content: center;gap: 20px;">
          <el-button style="width: 120px;" @click="closeDialog">取 消</el-button>
          <el-button style="width: 120px;" type="primary" @click="submitForm(formDataRef)">提 交</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>

</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useTable } from "./useTable";
import { useForm } from "./useForm";
import { Delete, Plus } from '@element-plus/icons-vue'
import { removeVideoData, batchRemoveVideoData, exportVideoInfo, addVideoData, upload } from "@/api/video";
import { ElMessage, ElMessageBox } from 'element-plus';
import dataset from './dataset';

import { getActorData } from "@/api/actor"; // 引入获取演员列表的API

const actorOptions = ref([]); // 存储演员列表

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
  fileChange,
} = useForm(fetchData);

const selectable = (row: any) => ![1, 2].includes(row.id)

const handleEdit = (row: any) => {
  if (row.coverUrl) {
    const files = row.coverUrl.split(';')

    files.forEach((file: any) => {
      fileList.value.push({ name: file, url: import.meta.env.VITE_BASE_URL + file })
    })
  }
  row.actorList = row.actor.split("、")
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
      await removeVideoData(row.id)
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
      await batchRemoveVideoData({ ids })
      fetchData()
      ElMessage.success("删除成功！")
    })

}

const removeFile = (file: any) => {
  fileList.value = fileList.value.filter((item: any) => item.name !== file.name)
}

const downloadDoc = () => {
  // exportVideoInfo()
  const link = document.createElement('a');
  link.href = import.meta.env.VITE_BASE_URL + '/video/download-doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
const downloadAllDoc = () => {
  // exportVideoInfo()
  const link = document.createElement('a');
  link.href = import.meta.env.VITE_BASE_URL + '/video/download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


const batchAdd = async () => {
  const params = dataset.map((item: any) => {
    item.coverUrl = "/" + item.videoName + ".png"
    return {
      ...formData.value,
      ...item,
    }
  })
  console.log(params);

  params.forEach(async (item: any) => {
    await addVideoData(item)
  })
  fetchData()

}

// 初始化加载数据
onMounted(async () => {
  try {
    const res = await getActorData(); // 请求演员列表
    const list = res?.data?.list || [];
    const actors = list.map((item: any) => {
      return {
        ...item,
        label: item.actorName,
        value: item.actorName
      }
    })
    actorOptions.value = actors;
  } catch (error) {
    console.error('获取演员列表失败:', error);
  }
  fetchData();
});

</script>
<style scoped></style>