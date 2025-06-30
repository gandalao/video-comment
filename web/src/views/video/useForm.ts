// useForm.ts
import { reactive, ref } from "vue";
import { addVideo, upload } from "@/api/video";
import type { FormInstance } from "element-plus";

export function useForm(refreshData: () => void) {
  const formData = reactive({
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

  const showAddDialog = () => {
    addDialogVisible.value = true;
  };
  const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    await formEl.validate(async (valid, fields) => {
      if (valid) {
        await addVideo(formData);
        addDialogVisible.value = false;
        formEl.resetFields();
        refreshData(); // 刷新列表
      } else {
        console.log("error submit!", fields);
      }
    });
  };

  const fileInput = ref(); // 用于操作隐藏的 input[type="file"]
  async function handleCoverUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      alert("请选择一个文件");
      return;
    }

    try {
      const formDataParams = new FormData();
      formDataParams.append("file", file);

      const response = await upload(formDataParams); // 调用封装的 upload 方法

      if (response.status === 200) {
        formData.coverUrl = response.data.url; // 填入返回的 URL
      } else {
        alert("上传失败");
      }
    } catch (err) {
      console.error("上传封面失败:", err);
      alert("上传出错");
    } finally {
      // 清空 input 值，允许重复上传同一个文件
      target.value = "";
    }
  }

  return {
    formData,
    formRules,
    formDataRef,
    addDialogVisible,
    showAddDialog,
    submitForm,
    handleCoverUpload,
    fileInput,
  };
}
