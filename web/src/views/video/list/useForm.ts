// useForm.ts
import { reactive, ref } from "vue";
import { addVideoData, editVideoData, upload } from "@/api/video";
import {
  ElMessage,
  type UploadFile,
  type UploadProps,
  type UploadUserFile,
  type FormInstance,
} from "element-plus";
export function useForm(refreshData: () => void) {
  // 日期格式化函数
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const formData = ref({
    videoName: "", // 视频名称
    actor: "", // 演员
    shortDesc: "", //简介
    coverUrl: "", //封面
    category: "", //分类
    series: "", //系列
    resolution: "1080p", //分辨率
    releaseDate: formatDate(new Date()), //上映时间
    subtitle: "外挂字幕", //字幕
    videoType: "有码", //类型
    actorList: [],
    imageUrl: "",
  });

  const formDataRef = ref();
  const formRules = {
    videoName: [{ required: true, message: "请输入视频名称", trigger: "blur" }],
    actorList: [
      { required: true, message: "请选择或输入演员", trigger: "blur" },
    ],
  };

  const addDialogVisible = ref(false);

  const fileList = ref<UploadUserFile[]>([]);

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
  const submitForm = async (formEl: FormInstance | undefined, type: string) => {
    // 上传图片
    if (type == "imageUpload") {
      let imageUrl = formData.value.imageUrl;
      if (imageUrl) {
        const res = await upload({ imageUrl });
        const list = {
          name: res.data.url,
          url: import.meta.env.VITE_BASE_URL + res.data.url,
        };
        fileList.value = [list];
      }
    } else {
      // 提交表单
      if (!formEl) return;
      await formEl.validate(async (valid, fields) => {
        if (valid) {
          try {
            formData.value.actor = formData.value.actorList.join("、");
            if (isEdit.value) {
              await editVideoData(formData.value);
            } else {
              await addVideoData(formData.value);
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
    }
  };

  const fileChange = (file: UploadFile, uploadFiles: UploadUserFile[]) => {
    console.log("文件选择:", file, uploadFiles);
    customUpload(file);
    fileList.value = uploadFiles;
    console.log(fileList.value);
  };

  const customUpload = async (uploadFile: UploadFile) => {
    const file = uploadFile.raw as File;
    if (!file) return;

    const fileName = formData.value.videoName || "default";
    const ext = file.name.substring(file.name.lastIndexOf("."));
    const newName = `${fileName}${ext}`;

    const formDataParam = new FormData();
    formDataParam.append("file", file, newName);

    try {
      const res = await upload(formDataParam);
      formData.value.coverUrl = res.data.url;
    } catch (error) {
      console.error("上传错误:", error);
    }
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
