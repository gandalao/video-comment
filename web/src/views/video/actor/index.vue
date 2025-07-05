<template>
  <div class="view-container">
    <!-- 操作栏 -->
    <div class="view-header">
      <div>
        <el-input v-model="searchParams.actorName" placeholder="输入名称搜索" style="width: 300px; margin-right: 10px;" />
        <el-button type="primary" @click="fetchData">搜索</el-button>
      </div>
      <div>
        <el-button type="primary" @click="showDialog">添加演员</el-button>
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="view-main">
      <el-table :data="tableData" @selection-change="handleSelectionChange" border style="height:100%;width: 100%">
        <el-table-column type="selection" :selectable="selectable" width="55" />
        <el-table-column prop="actorName" label="姓名" width="160">
          <template #default="{ row }">
            <div class="top-badge">
              <span>{{ row.actorName }}</span>
              <div>
                <span v-if="row.isTop" class="top-badge-bg"></span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="actorNameJp" label="日语" width="160"></el-table-column>
        <el-table-column prop="gender" label="性别" width="120"></el-table-column>
        <el-table-column label="年龄" width="120">
          <template #default="scope">
            {{ calculateAge(scope.row.birthday) }}
          </template>
        </el-table-column>
        <el-table-column prop="height" label="身高" width="120">
          <template #default="scope">
            <span v-if="scope.row.height">{{ scope.row.height / 100 }}m</span>
          </template>
        </el-table-column>
        <el-table-column prop="introduce" label="介绍" min-width="200">
          <template #default="{ row }">
            <el-popover trigger="hover" placement="top-start" :width="400">
              <p>{{ row.introduce }}</p>
              <template #reference>
                <div class="ellipsis-two-lines">{{ row.introduce }}</div>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column prop="birthday" label="出生日期" width="160"></el-table-column>
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row, 'top')">
              置顶
            </el-button>

            <el-button link type="primary" size="small" @click="handleEdit(scope.row, 'edit')">
              编辑
            </el-button>
            <el-button link type="danger" size="small" @click="handleRemove(scope.row)">删除</el-button>
            <el-button v-if="scope.row.isTop" link type="warning" size="small" @click="handleEdit(scope.row, 'untop')">
              取消置顶
            </el-button>
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
  <el-dialog v-model="addDialogVisible" title="添加演员" :close-on-click-modal="false" @close="closeDialog" align-center>
    <el-form :model="formData" label-width="100px" :rules="formRules" ref="formDataRef">
      <el-form-item label="姓名" prop="actorName">
        <el-input v-model="formData.actorName" />
      </el-form-item>
      <el-form-item label="日文姓名" prop="actorNameJp">
        <el-input v-model="formData.actorNameJp" />
      </el-form-item>
      <el-form-item label="出生日期" prop="birthday">
        <el-date-picker v-model="formData.birthday" type="date" value-format="YYYY-MM-DD" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-select v-model="formData.gender" placeholder="请选择">
          <el-option label="女" value="女" />
          <el-option label="男" value="男" />
        </el-select>
      </el-form-item>

      <el-form-item label="头像">
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


      <el-form-item label="身高" prop="height">
        <el-input v-model="formData.height" @input="value => formData.height = value.replace(/[^0-9]/g, '')">
          <template #append>cm</template>
        </el-input>
      </el-form-item>
      <el-form-item label="介绍" prop="introduce">
        <el-input v-model="formData.introduce" :rows="4" type="textarea" />
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
import { removeActorData, batchRemoveVideoDataActorData } from "@/api/actor";
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
  fileChange,
} = useForm(fetchData);

const selectable = (row: any) => ![1, 2].includes(row.id)

const handleEdit = (row: any, type: string) => {
  if (type === 'top' || type === 'untop') {
    row.isTop = type == 'top' ? 1 : 0;
    formData.value = row;
    submitForm(formDataRef.value, type)
    return
  }
  if (row.avatarUrl) {
    const files = row.avatarUrl.split(';')
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
      await removeActorData(row.id)
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
      await batchRemoveVideoDataActorData({ ids })
      fetchData()
      ElMessage.success("删除成功！")
    })

}

const removeFile = (file: any) => {
  fileList.value = fileList.value.filter((item: any) => item.name !== file.name)
}

const isValidDate = (date: Date): boolean => {
  return date.toString() !== 'Invalid Date' && !isNaN(date.getTime());
};

const calculateAge = (birthday: string): number => {
  const birthDate = new Date(birthday);

  if (!isValidDate(birthDate)) {
    throw new Error(`Invalid birthday format: ${birthday}`);
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// 初始化加载数据
onMounted(() => {
  fetchData();
  console.log(calculateAge("2000-01-01"));

});

</script>
<style scoped lang="scss">
.top-badge {
  .top-badge-bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 16px 16px 0;
    /* 右上方向的三角形 */
    border-color: transparent red transparent transparent;
    /* 红色三角形 */
    transform: rotate(-90deg);
    /* 斜着的效果 */
    margin: 2px 0 0 2px;
    /* 微调位置 */
  }
}
</style>