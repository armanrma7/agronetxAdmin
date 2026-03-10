import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, Select, Space, notification } from "antd";
import { DataTable, DataTableColumn, RowAction } from "../../components/table/DataTable";
import { apiClient } from "../../api/client";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { normalizePaginated } from "../../utils/pagination";
import { CreateUserModal } from "../../components/forms/CreateUserModal";

interface User {
  id: string;
  phone: string;
  full_name?: string;
  user_type?: "farmer" | "company" | "admin";
  user_status?: "active" | "blocked" | "inactive" | "pending";
  company_name?: string;
  is_locked?: boolean;
}

type UserTypeFilter = NonNullable<User["user_type"]>;
type UserStatusFilter = NonNullable<User["user_status"]>;

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<UserTypeFilter | undefined>();
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedPhone = useDebouncedValue(phoneSearch);
  const debouncedName = useDebouncedValue(nameSearch);

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "admin-users",
      page,
      pageSize,
      typeFilter,
      statusFilter,
      debouncedPhone,
      debouncedName
    ],
    queryFn: async () => {
      const res = await apiClient.get("/admin/users", {
        params: {
          page,
          limit: pageSize,
          user_type: typeFilter,
          account_status: statusFilter,
          phone: debouncedPhone || undefined,
          name: debouncedName || undefined
        }
      });
      return normalizePaginated<User>(res.data, ["users"]);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (payload: {
      userId: string;
      user_type?: UserTypeFilter;
      user_status?: UserStatusFilter;
    }) =>
      apiClient.patch(`/admin/users/${payload.userId}`, {
        user_type: payload.user_type,
        user_status: payload.user_status
      }),
    onSuccess: () => {
      notification.success({ message: "User updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: any) => {
      notification.error({
        message: "Failed to update user",
        description: error.response?.data?.message ?? "Unexpected error"
      });
    }
  });

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  };

  const columns: DataTableColumn<User>[] = [
    { key: "full_name", title: "Name" },
    { key: "phone", title: "Phone" },
    { key: "user_type", title: "Type" },
    { key: "account_status", title: "User Status" },
    {
      key: "is_locked",
      title: "Locked",
      render: (_, record) => (record.is_locked ? "Yes" : "No")
    }
  ];

  const actions: RowAction<User>[] = [
    // change type
    {
      key: "type-farmer",
      label: "Set type: Farmer",
      onClick: (user) =>
        updateUserMutation.mutate({
          userId: user.id,
          user_type: "farmer"
        })
    },
    {
      key: "type-company",
      label: "Set type: Company",
      onClick: (user) =>
        updateUserMutation.mutate({
          userId: user.id,
          user_type: "company"
        })
    },
    {
      key: "type-admin",
      label: "Set type: Admin",
      onClick: (user) =>
        updateUserMutation.mutate({
          userId: user.id,
          user_type: "admin"
        })
    },
    // change status
    {
      key: "status-active",
      label: "Set status: Active",
      onClick: (user) =>
        updateUserMutation.mutate({
          userId: user.id,
          user_status: "active"
        })
    },
    {
      key: "status-blocked",
      label: "Set status: Blocked",
      danger: true,
      onClick: (user) =>
        updateUserMutation.mutate({
          userId: user.id,
          user_status: "blocked"
        })
    },
    {
      key: "status-inactive",
      label: "Set status: Inactive",
      onClick: (user) =>
        updateUserMutation.mutate({
          userId: user.id,
          user_status: "inactive"
        })
    },
    {
      key: "status-pending",
      label: "Set status: Pending",
      onClick: (user) =>
        updateUserMutation.mutate({
          userId: user.id,
          user_status: "pending"
        })
    }
  ];

  return (
    <>
      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap"
        }}
      >
        <Space wrap>
          <Select<UserTypeFilter>
            allowClear
            placeholder="User type"
            style={{ minWidth: 160 }}
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: "Farmer", value: "farmer" },
              { label: "Company", value: "company" },
              { label: "Admin", value: "admin" }
            ]}
          />
          <Select<UserStatusFilter>
            allowClear
            placeholder="Account status"
            style={{ minWidth: 180 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Active", value: "active" },
              { label: "Blocked", value: "blocked" },
              { label: "Inactive", value: "inactive" },
              { label: "Pending", value: "pending" }
            ]}
          />
          <Input
            style={{ minWidth: 180 }}
            placeholder="Search by phone"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
          />
          <Input
            style={{ minWidth: 180 }}
            placeholder="Search by name"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
          />
        </Space>
        <Button type="primary" onClick={() => setCreateOpen(true)}>
          Create User
        </Button>
      </Space>
      <DataTable<User>
        columns={columns}
        data={data?.items}
        loading={isLoading}
        total={data?.total}
        page={page}
        pageSize={pageSize}
        rowActions={actions}
        onPageChange={handlePageChange}
        rowKey={(row) => row.id}
        toolbarTitle="Users"
        searchValue=""
        onResetFilters={() => {
          setTypeFilter(undefined);
          setStatusFilter(undefined);
          setPhoneSearch("");
          setNameSearch("");
          setPage(1);
        }}
      />
      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          refetch();
        }}
      />
      </>
  );
};

