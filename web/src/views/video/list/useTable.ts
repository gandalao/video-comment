import { ref } from "vue";
import { getVideoData } from "@/api/video";

export function useTable() {
  const tableData = ref([]);
  const getSearchParams = () => {
    return {
      videoName: "",
      actor: "",
      category: "",
      videoType: "",
      resolution: "",
      subtitle: "",
    }
  };
  const searchParams = ref(getSearchParams());

  const currentPage = ref(1);
  const pageSize = ref(20);
  const total = ref(0);

  const fetchData = async () => {
    const params = {
      ...searchParams.value,
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    const response = await getVideoData(params);
    tableData.value = response.data.list || [];
    total.value = response.data.total || 0;
  };

  const handlePageChange = (page: number) => {
    currentPage.value = page;
    fetchData();
  };

  const handleSizeChange = (size: number) => {
    pageSize.value = size;
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
    handleSizeChange,
    getSearchParams
  };
}
