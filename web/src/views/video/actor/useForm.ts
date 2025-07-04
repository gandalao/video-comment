// useForm.ts
import { ref } from "vue";
import { addActorData, editActorData } from "@/api/actor";
import { upload } from "@/api/video";
import {
  ElMessage,
  type UploadFile,
  type UploadUserFile,
  type FormInstance,
} from "element-plus";
export function useForm(refreshData: () => void) {
  const getDefaultFormData = () => {
    return {
      actorName: "", // 演员名称
      actorNameJp: "", //演员名称(日语)
      gender: "女",
      avatarUrl: "",
      birthday: "2000-01-01", //生日
      height: "", //身高
      introduce: "",
      isTop: 0,
      cupSize: "",

      imageUrl: "",
    };
  };

  const formData = ref(getDefaultFormData());

  const formDataRef = ref();
  const formRules = {
    actorName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  };

  const addDialogVisible = ref(false);

  const fileList = ref<UploadUserFile[]>([]);

  const isEdit = ref(false);
  const showDialog = (enableEdit: boolean | Event = false) => {
    addDialogVisible.value = true;
    isEdit.value = typeof enableEdit === "boolean" ? enableEdit : false;
  };

  const resetData = () => {
    formData.value = getDefaultFormData();
    fileList.value = [];
    isEdit.value = false;
  };

  const closeDialog = () => {
    addDialogVisible.value = false;
    resetData();
  };
  const submitForm = async (formEl: FormInstance | undefined, type: string) => {
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
    } else if (type == "top" || type == "untop") {
      await editActorData(formData.value);
      let mes = type == "top" ? "置顶成功" : "已取消置顶";
      ElMessage.success(mes);
      resetData();
      refreshData();
    } else {
      if (!formEl) return;
      await formEl.validate(async (valid, fields) => {
        if (valid) {
          try {
            if (isEdit.value) {
              await editActorData(formData.value);
            } else {
              await addActorData(formData.value);
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

    const fileName = formData.value.actorName || "default";
    const ext = file.name.substring(file.name.lastIndexOf("."));
    const newName = `${fileName}${ext}`;

    const formDataParam = new FormData();
    formDataParam.append("file", file, newName);

    try {
      const res = await upload(formDataParam);
      formData.value.avatarUrl = res.data.url;
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
