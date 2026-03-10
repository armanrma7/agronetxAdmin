import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tooltip } from "antd";
import { DataTable, DataTableColumn } from "../../components/table/DataTable";
import { apiClient } from "../../api/client";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

interface Device {
  id: string;
  device_type: string;
  device_model: string;
  app_version: string;
  os_version: string;
  fcm_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name?: string;
  };
  user_id?: string;
}

export const DevicesPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ["devices", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const res = await apiClient.get<Device[]>("/device-tokens");
      const items = Array.isArray(res.data) ? res.data : [];
      return { items, total: items.length };
    }
  });

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  const columns: DataTableColumn<Device>[] = [
    { key: "device_type", title: "Platform" },
    { key: "device_model", title: "Device Model" },
    { key: "app_version", title: "App Version" },
    { key: "os_version", title: "OS Version" },
    {
      key: "user",
      title: "User",
      render: (_, record) => record.user?.full_name ?? "-"
    },
    {
      key: "fcm_token",
      title: "FCM Token",
      render: (_, record) =>
        record.fcm_token ? (
          <Tooltip title={record.fcm_token}>
            <span style={{ maxWidth: 200, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {record.fcm_token}
            </span>
          </Tooltip>
        ) : (
          "-"
        )
    },
    {
      key: "is_active",
      title: "Active",
      render: (_, record) => (record.is_active ? "Yes" : "No")
    },
    { key: "created_at", title: "Created At" },
    { key: "updated_at", title: "Updated At" }
  ];

  return (
    <DataTable<Device>
      columns={columns}
      data={data?.items}
      loading={isLoading}
      total={data?.total}
      page={page}
      pageSize={pageSize}
      onPageChange={handlePageChange}
      rowKey={(row) => row.id}
      toolbarTitle="Devices"
      searchPlaceholder="Search devices"
      searchValue={search}
      onSearchChange={setSearch}
      onResetFilters={() => {
        setSearch("");
        setPage(1);
      }}
    />
  );
};

