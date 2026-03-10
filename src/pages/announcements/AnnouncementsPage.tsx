import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, DatePicker, Input, Select, Space, notification } from "antd";
import { apiClient } from "../../api/client";
import { DataTable, DataTableColumn, RowAction } from "../../components/table/DataTable";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { normalizePaginated } from "../../utils/pagination";

interface Announcement {
  id: string;
  type: "sell" | "buy";
  category: "goods" | "rent" | "service";
  price: string;
  status: "pending" | "published" | "closed" | "canceled" | "blocked";
  applications_count?: number;
  created_at?: string;
  updated_at?: string;
  description?: string;
  count?: string;
  available_quantity?: string;
  views_count?: number;
  group?: { name_am?: string };
  item?: { name_am?: string };
  owner?: { full_name?: string };
}

type CategoryFilter = "goods" | "rent" | "service";
type TypeFilter = "sell" | "buy";
type StatusFilter = "pending" | "published" | "closed" | "canceled" | "blocked";

export const AnnouncementsPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const [category, setCategory] = useState<CategoryFilter[]>([]);
  const [type, setType] = useState<TypeFilter | undefined>();
  const [status, setStatus] = useState<StatusFilter | undefined>();
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [subgroupIds, setSubgroupIds] = useState<string[]>([]);
  const [regionIds, setRegionIds] = useState<string[]>([]);
  const [villageIds, setVillageIds] = useState<string[]>([]);
  const [priceFrom, setPriceFrom] = useState<number | undefined>();
  const [priceTo, setPriceTo] = useState<number | undefined>();
  const [createdFrom, setCreatedFrom] = useState<string | undefined>();
  const [createdTo, setCreatedTo] = useState<string | undefined>();
  const [ownerId, setOwnerId] = useState<string>("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "announcements",
      page,
      pageSize,
      debouncedSearch,
      category,
      type,
      status,
      groupIds,
      subgroupIds,
      regionIds,
      villageIds,
      priceFrom,
      priceTo,
      createdFrom,
      createdTo,
      ownerId
    ],
    queryFn: async () => {
      const res = await apiClient.get("/announcements", {
        params: {
          page,
          limit: pageSize,
          // simple filters
          type,
          status,
          owner_id: ownerId || undefined,
          price_from: priceFrom,
          price_to: priceTo,
          created_from: createdFrom,
          created_to: createdTo,
          // multi-value filters (axios will repeat keys)
          category: category.length ? category : undefined,
          group_id: groupIds.length ? groupIds : undefined,
          subgroup_id: subgroupIds.length ? subgroupIds : undefined,
          region: regionIds.length ? regionIds : undefined,
          village: villageIds.length ? villageIds : undefined
        }
      });
      return normalizePaginated<Announcement>(res.data, ["announcements"]);
    }
  });

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  const updateStatus = async (record: Announcement, nextStatus: Announcement["status"]) => {
    if (record.status === nextStatus) return;

    let endpoint: string | null = null;
    switch (nextStatus) {
      case "published":
        endpoint = `/announcements/${record.id}/publish`;
        break;
      case "closed":
        endpoint = `/announcements/${record.id}/close`;
        break;
      case "canceled":
        endpoint = `/announcements/${record.id}/cancel`;
        break;
      case "blocked":
        endpoint = `/announcements/${record.id}/block`;
        break;
      case "pending":
      default:
        endpoint = null;
    }

    if (!endpoint) {
      notification.warning({
        message: "Pending status is controlled by backend and cannot be set directly."
      });
      return;
    }

    try {
      await apiClient.post(endpoint);
      notification.success({
        message: `Announcement set to ${nextStatus}`
      });
      refetch();
    } catch (error: any) {
      notification.error({
        message: "Action failed",
        description: error.response?.data?.message ?? "Unable to update announcement"
      });
    }
  };

  const handleDelete = async (record: Announcement) => {
    try {
      await apiClient.delete(`/announcements/${record.id}`);
      notification.success({ message: "Announcement deleted" });
      refetch();
    } catch (error: any) {
      notification.error({
        message: "Delete failed",
        description: error.response?.data?.message ?? "Unable to delete announcement"
      });
    }
  };

  const columns: DataTableColumn<Announcement>[] = [
    { key: "type", title: "Type" },
    { key: "category", title: "Category" },
    {
      key: "group",
      title: "Group",
      render: (_, record) => record.group?.name_am ?? "-"
    },
    {
      key: "item",
      title: "Item",
      render: (_, record) => record.item?.name_am ?? "-"
    },
    {
      key: "status",
      title: "Status",
      render: (_, record) => record.status
    },
    {
      key: "price",
      title: "Price",
      sortable: true
    },
    {
      key: "count",
      title: "Count"
    },
    {
      key: "available_quantity",
      title: "Available"
    },
    {
      key: "applications_count",
      title: "Applications",
      sortable: true
    },
    {
      key: "views_count",
      title: "Views",
      sortable: true
    },
    {
      key: "owner",
      title: "Owner",
      render: (_, record) => record.owner?.full_name ?? "-"
    },
    {
      key: "created_at",
      title: "Created At",
      sortable: true
    },
    {
      key: "updated_at",
      title: "Updated At",
      sortable: true
    }
  ];

  const actions: RowAction<Announcement>[] = [
    {
      key: "set-published",
      label: "Set Published",
      onClick: (record) => updateStatus(record, "published")
    },
    {
      key: "set-closed",
      label: "Set Closed",
      onClick: (record) => updateStatus(record, "closed")
    },
    {
      key: "set-canceled",
      label: "Set Canceled",
      onClick: (record) => updateStatus(record, "canceled")
    },
    {
      key: "set-blocked",
      label: "Set Blocked",
      danger: true,
      onClick: (record) => updateStatus(record, "blocked")
    },
    {
      key: "delete",
      label: "Delete",
      danger: true,
      onClick: handleDelete
    }
  ];

  const resetFilters = () => {
    setCategory([]);
    setType(undefined);
    setStatus(undefined);
    setGroupIds([]);
    setSubgroupIds([]);
    setRegionIds([]);
    setVillageIds([]);
    setPriceFrom(undefined);
    setPriceTo(undefined);
    setCreatedFrom(undefined);
    setCreatedTo(undefined);
    setOwnerId("");
    setPage(1);
  };

  return (
    <>
      <Space
        style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}
        size="middle"
      >
        <Select
          mode="multiple"
          allowClear
          style={{ minWidth: 180 }}
          placeholder="Category"
          value={category}
          onChange={(vals) => setCategory(vals as CategoryFilter[])}
          options={[
            { label: "Goods", value: "goods" },
            { label: "Rent", value: "rent" },
            { label: "Service", value: "service" }
          ]}
        />
        <Select<TypeFilter>
          allowClear
          style={{ minWidth: 140 }}
          placeholder="Type"
          value={type}
          onChange={setType}
          options={[
            { label: "Sell", value: "sell" },
            { label: "Buy", value: "buy" }
          ]}
        />
        <Select<StatusFilter>
          allowClear
          style={{ minWidth: 180 }}
          placeholder="Status"
          value={status}
          onChange={setStatus}
          options={[
            { label: "Pending", value: "pending" },
            { label: "Published", value: "published" },
            { label: "Closed", value: "closed" },
            { label: "Canceled", value: "canceled" },
            { label: "Blocked", value: "blocked" }
          ]}
        />
        <Input
          style={{ width: 220 }}
          placeholder="Owner ID"
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
        />
        <Input
          style={{ width: 120 }}
          placeholder="Price from"
          type="number"
          value={priceFrom ?? ""}
          onChange={(e) =>
            setPriceFrom(e.target.value ? Number(e.target.value) : undefined)
          }
        />
        <Input
          style={{ width: 120 }}
          placeholder="Price to"
          type="number"
          value={priceTo ?? ""}
          onChange={(e) => setPriceTo(e.target.value ? Number(e.target.value) : undefined)}
        />
        <DatePicker
          placeholder="Created from"
          onChange={(d) => setCreatedFrom(d ? d.format("YYYY-MM-DD") : undefined)}
        />
        <DatePicker
          placeholder="Created to"
          onChange={(d) => setCreatedTo(d ? d.format("YYYY-MM-DD") : undefined)}
        />
        <Button onClick={resetFilters}>Reset filters</Button>
      </Space>
      <DataTable<Announcement>
        columns={columns}
        data={data?.items}
        loading={isLoading}
        total={data?.total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        rowKey={(row) => row.id}
        rowActions={actions}
        searchValue=""
        onResetFilters={resetFilters}
      />
    </>
  );
};

