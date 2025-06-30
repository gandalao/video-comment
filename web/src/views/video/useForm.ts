// useForm.ts
import { reactive, ref } from "vue";
import { addVideo, editVideo, upload } from "@/api/video";
import {
  ElMessage,
  type UploadFile,
  type UploadProps,
  type UploadUserFile,
  type FormInstance,
} from "element-plus";
export function useForm(refreshData: () => void) {
  const formData = ref({
    videoName: "",
    actor: "",
    shortDesc: "",
    coverUrl: "",
    category: "",
    releaseDate: "",
  });

  const formDataRef = ref();
  const formRules = {
    videoName: [{ required: true, message: "请输入视频名称", trigger: "blur" }],
  };

  const addDialogVisible = ref(false);

  const fileList = ref<UploadUserFile[]>([]);
  const uploadList = ref<UploadUserFile[]>([]);

  const isEdit = ref(false);
  const showDialog = (enableEdit: boolean | Event = false) => {
    addDialogVisible.value = true;
    isEdit.value = typeof enableEdit === "boolean" ? enableEdit : false;
  };

  const closeDialog = () => {
    addDialogVisible.value = false;
    if (formDataRef.value) {
      formDataRef.value.resetFields();
    }
    fileList.value = [];
    isEdit.value = false;
  };
  const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
      if (valid) {
        try {
          const filePaths = await onUpload();
          formData.value.coverUrl = filePaths.join(";");
          if (isEdit.value) {
            await editVideo(formData.value);
          } else {
            await addVideo(formData.value);
          }
          ElMessage.success("操作成功");
          closeDialog();
          refreshData(); // 刷新列表
        } catch (error) {
          console.error("视频添加失败:");
        }
      } else {
        console.log("error submit!", fields);
      }
    });
  };

  const fileChange = (file: UploadFile, uploadFiles: UploadUserFile[]) => {
    console.log("文件选择:", file, uploadFiles);
    fileList.value = uploadFiles;
    uploadList.value = uploadFiles;
  };

  const onUpload = async () => {
    if (!uploadList.value || uploadList.value.length === 0) return [];
    const formDataParam = new FormData();
    uploadList.value.forEach((file) => {
      if (file.raw) {
        formDataParam.append("files", file.raw);
      }
    });

    const res = await upload(formDataParam);

    return res.data.url;
  };

  return {
    formData,
    formRules,
    formDataRef,
    addDialogVisible,
    showDialog,
    closeDialog,
    submitForm,
    fileList,
    fileChange,
  };
}
