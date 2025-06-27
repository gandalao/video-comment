<template>
  <el-container style="padding: 20px;">
    <!-- 操作栏 -->
    <el-header style="margin-bottom: 20px; background: #fff; padding: 10px; z-index: 10;">
      <el-input v-model="searchVideoName" placeholder="输入视频名称搜索" style="width: 300px; margin-right: 10px;" />
      <el-button type="primary" @click="fetchVideos">搜索</el-button>
      <el-button type="success" @click="showAddDialog">添加视频</el-button>
    </el-header>

    <!-- 视频列表 -->
    <el-main style="overflow-y: auto; max-height: 60vh;">
      <el-table :data="videos" border style="width: 100%">
        <el-table-column prop="videoName" label="视频名称"></el-table-column>
        <el-table-column prop="shortDesc" label="简介"></el-table-column>
        <el-table-column label="封面">
          <template #default="{ row }">
            <el-image v-if="row.coverUrl" :src="$baseURL + '/' + row.coverUrl" style="width: 80px; height: 60px;"
              fit="cover" :preview-src-list="[row.coverUrl]" />
            <span v-else>无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
      </el-table>
    </el-main>

    <!-- 分页 -->
    <el-footer style="background: #fff; padding: 10px; z-index: 10;">
      <el-pagination layout="prev, pager, next" :total="total" :page-size="pageSize" v-model:current-page="currentPage"
        @current-change="handlePageChange" />
    </el-footer>
  </el-container>

  <!-- 添加视频对话框 -->
  <el-dialog v-model="addDialogVisible" title="添加视频">
    <el-form :model="newVideo" label-width="100px" :rules="rules" ref="formRef">
      <el-form-item label="视频名称" prop="videoName">
        <el-input v-model="newVideo.videoName" />
      </el-form-item>
      <el-form-item label="简介" prop="shortDesc">
        <el-input v-model="newVideo.shortDesc" />
      </el-form-item>
      <el-form-item label="详细介绍" prop="fullDesc">
        <el-input v-model="newVideo.fullDesc" type="textarea" :rows="3" />
      </el-form-item>
      <el-form-item label="封面地址" prop="coverUrl">
        <el-input v-model="newVideo.coverUrl" style="width: 80%; float: left;" readonly />
        <input type="file" @change="handleCoverUpload" style="display: none;" ref="fileInput" />
        <el-button type="primary" @click="fileInput.click()" style="margin-left: 10px;">上传封面</el-button>
      </el-form-item>
      <el-form-item label="封面预览">
        <el-image v-if="newVideo.coverUrl" :src="newVideo.coverUrl" style="width: 120px; height: 90px;" fit="cover" />
        <span v-else>未上传封面</span>
      </el-form-item>
      <el-form-item label="视频地址" prop="videoUrl">
        <el-input v-model="newVideo.videoUrl" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="newVideo.remark" />
      </el-form-item>
      <el-form-item>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">提交</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { addVideo, getVideoList, upload } from "../../api/video"


// 数据定义
const videos = ref([]);
const searchVideoName = ref('');
const currentPage = ref(1);
const pageSize = 10;
const total = ref(0);

// 添加视频相关
const addDialogVisible = ref(false);
const newVideo = ref({
  videoName: '',
  shortDesc: '',
  fullDesc: '',
  coverUrl: '',
  videoUrl: '',
  remark: ''
});

// 表单验证规则
const rules = {
  videoName: [{ required: true, message: '请输入视频名称', trigger: 'blur' }],
  shortDesc: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  fullDesc: [{ required: true, message: '请输入详细介绍', trigger: 'blur' }],
  coverUrl: [{ required: true, message: '请输入封面地址', trigger: 'blur' }],
  videoUrl: [{ required: true, message: '请输入视频地址', trigger: 'blur' }]
};

// 获取视频列表
async function fetchVideos() {
  try {
    const params = {
      videoName: searchVideoName.value,
      page: currentPage.value,
      pageSize: pageSize
    };

    const response = await getVideoList(params);
    videos.value = response.data.list || [];
    total.value = response.data.total || 0;
  } catch (err) {
    console.error('获取视频失败:', err);
  }
}

// 分页切换
function handlePageChange(page: number) {
  currentPage.value = page;
  fetchVideos();
}

// 显示添加弹窗
function showAddDialog() {
  addDialogVisible.value = true;
}

// 提交添加表单
async function submitAddForm() {
  try {
    const response = await addVideo(newVideo.value);
    if (response.data.code === 200) {
      addDialogVisible.value = false;
      fetchVideos(); // 刷新列表
    }
  } catch (err) {
    console.error('添加视频失败:', err);
  }
}

const fileInput = ref(); // 用于操作隐藏的 input[type="file"]
async function handleCoverUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    alert('请选择一个文件');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await upload(formData); // 调用封装的 upload 方法

    if (response.status === 200) {
      newVideo.value.coverUrl = response.data.url; // 填入返回的 URL
    } else {
      alert('上传失败');
    }
  } catch (err) {
    console.error('上传封面失败:', err);
    alert('上传出错');
  } finally {
    // 清空 input 值，允许重复上传同一个文件
    target.value = '';
  }
}

// 初始化加载数据
onMounted(() => {
  fetchVideos();
});
</script>
<style scoped>
.el-table {
  margin-bottom: 20px;
}

.el-pagination {
  justify-content: center;
}

.el-main {
  overflow-y: auto;
  max-height: 60vh;
}

.el-footer {
  position: sticky;
  bottom: 0;
  background-color: #fff;
}
</style>