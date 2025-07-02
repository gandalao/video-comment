import { ref, reactive } from "vue";
import { getActorData } from "@/api/actor";

export function useTable() {
  const tableData = ref([]);
  const searchParams = reactive({
    actorName: "",
  });

  const currentPage = ref(1);
  const pageSize = ref(15);
  const total = ref(0);

  const fetchData = async () => {
    const params = {
      actorName: searchParams.actorName,
      page: currentPage.value,
      pageSize: pageSize.value,
    };
    const response = await getActorData(params);
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
