import { ref } from "vue";
import { getVideoData } from "@/api/video";

export function useTable() {
  const tableData = ref([]);
  const searchParams = ref({
    videoName: "",
    actor: "",
    category: "",
  });

  const currentPage = ref(1);
  const pageSize = ref(15);
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
