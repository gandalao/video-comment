import { ref, reactive } from "vue";
import { getVideoList } from "@/api/video";

export function useTable() {
  const tableData = ref([]);
  const searchParams = reactive({
    videoName: "",
    actor: "",
    category: "",
  });

  const currentPage = ref(1);
  const pageSize = ref(15);
  const total = ref(0);

  const fetchData = async () => {
    const params = {
      videoName: searchParams.videoName,
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    const response = await getVideoList(params);
    tableData.value = response.data.list || [];
    total.value = response.data.total || 0;
  };

  const handlePageChange = (page: number) => {
    currentPage.value = page;
    fetchData();
  };

  return {
    tableData,
    searchParams,
    currentPage,
    pageSize,
    total,
    fetchData,
    handlePageChange,
  };
}
