import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, DataTableColumn } from "../../components/table/DataTable";
import { apiClient } from "../../api/client";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

interface Favorite {
  id: string;
  announcementId: string;
  createdAt?: string;
}

export const FavoritesPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get<Favorite[]>("/favorites");
      const items = Array.isArray(res.data) ? res.data : [];
      return { items, total: items.length };
    }
  });

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  const columns: DataTableColumn<Favorite>[] = [
    { key: "announcementId", title: "Announcement ID" },
    { key: "createdAt", title: "Created At" }
  ];

  return (
    <DataTable<Favorite>
      columns={columns}
      data={data?.items}
      loading={isLoading}
      total={data?.total}
      page={page}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      rowKey={(row) => row.id}
      toolbarTitle="Favorites"
      searchPlaceholder="Search favorites"
      searchValue={search}
      onSearchChange={setSearch}
      onResetFilters={() => {
        setSearch("");
        setPage(1);
      }}
    />
  );
};

