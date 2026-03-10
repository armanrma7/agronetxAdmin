import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DatePicker, Input, Select, Space, notification } from "antd";
import { DataTable, DataTableColumn, RowAction } from "../../components/table/DataTable";
import { apiClient } from "../../api/client";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { normalizePaginated } from "../../utils/pagination";

interface Application {
  id: string;
  status: "pending" | "approved" | "rejected" | "canceled" | "closed";
  created_at?: string;
}

type StatusFilter = Application["status"];

export const ApplicationsPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [applicantId, setApplicantId] = useState("");
  const [announcementId, setAnnouncementId] = useState("");
  const [announcementOwnerId, setAnnouncementOwnerId] = useState("");
  const [status, setStatus] = useState<StatusFilter | undefined>();
  const [createdFrom, setCreatedFrom] = useState<string | undefined>();
  const [createdTo, setCreatedTo] = useState<string | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: [
      "applications",
      page,
      pageSize,
      debouncedSearch,
      applicantId,
      announcementId,
      announcementOwnerId,
      status,
      createdFrom,
      createdTo
    ],
    queryFn: async () => {
      const res = await apiClient.get("/applications", {
        params: {
          page,
          limit: pageSize,
          applicant_id: applicantId || undefined,
          announcementId: announcementId || undefined,
          announcement_owner_id: announcementOwnerId || undefined,
          status,
          created_from: createdFrom,
          created_to: createdTo
        }
      });
      return normalizePaginated<Application>(res.data, ["applications"]);
    }
  });

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  const updateStatus = async (record: Application, nextStatus: Application["status"]) => {
    if (record.status === nextStatus) return;

    let endpoint: string | null = null;
    switch (nextStatus) {
      case "approved":
        endpoint = `/applications/${record.id}/approve`;
        break;
      case "rejected":
        endpoint = `/applications/${record.id}/reject`;
        break;
      case "canceled":
        endpoint = `/applications/${record.id}/cancel`;
        break;
      case "closed":
        endpoint = `/applications/${record.id}/close`;
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
        message: `Application set to ${nextStatus}`
      });
    } catch (error: any) {
      notification.error({
        message: "Action failed",
        description: error.response?.data?.message ?? "Unable to update application"
      });
    }
  };

  const columns: DataTableColumn<Application>[] = [
    { key: "id", title: "ID" },
    { key: "status", title: "Status" },
    { key: "created_at", title: "Created At" }
  ];

  const actions: RowAction<Application>[] = [
    {
      key: "set-approved",
      label: "Set Approved",
      onClick: (record) => updateStatus(record, "approved")
    },
    {
      key: "set-rejected",
      label: "Set Rejected",
      onClick: (record) => updateStatus(record, "rejected")
    },
    {
      key: "set-canceled",
      label: "Set Canceled",
      onClick: (record) => updateStatus(record, "canceled")
    },
    {
      key: "set-closed",
      label: "Set Closed",
      onClick: (record) => updateStatus(record, "closed")
    }
  ];

  return (
    <>
      <Space
        style={{ marginBottom: 16, display: "flex", flexWrap: "wrap" }}
        size="middle"
      >
        <Input
          style={{ width: 220 }}
          placeholder="Applicant ID"
          value={applicantId}
          onChange={(e) => setApplicantId(e.target.value)}
        />
        <Input
          style={{ width: 220 }}
          placeholder="Announcement ID"
          value={announcementId}
          onChange={(e) => setAnnouncementId(e.target.value)}
        />
        <Input
          style={{ width: 220 }}
          placeholder="Announcement Owner ID"
          value={announcementOwnerId}
          onChange={(e) => setAnnouncementOwnerId(e.target.value)}
        />
        <Select<StatusFilter>
          allowClear
          style={{ minWidth: 180 }}
          placeholder="Status"
          value={status}
          onChange={setStatus}
          options={[
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
            { label: "Canceled", value: "canceled" },
            { label: "Closed", value: "closed" }
          ]}
        />
        <DatePicker
          placeholder="Created from"
          onChange={(d) => setCreatedFrom(d ? d.format("YYYY-MM-DD") : undefined)}
        />
        <DatePicker
          placeholder="Created to"
          onChange={(d) => setCreatedTo(d ? d.format("YYYY-MM-DD") : undefined)}
        />
      </Space>
      <DataTable<Application>
        columns={columns}
        data={data?.items}
        loading={isLoading}
        total={data?.total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        rowKey={(row) => row.id}
        rowActions={actions}
        toolbarTitle="Applications"
        searchValue=""
        onResetFilters={() => {
          setApplicantId("");
          setAnnouncementId("");
          setAnnouncementOwnerId("");
          setStatus(undefined);
          setCreatedFrom(undefined);
          setCreatedTo(undefined);
          setPage(1);
        }}
      />
    </>
  );
};

