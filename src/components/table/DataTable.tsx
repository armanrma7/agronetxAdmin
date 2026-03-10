import { Table, TablePaginationConfig } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReactNode } from "react";
import { TableToolbar } from "./TableToolbar";

export interface DataTableColumn<T> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface RowAction<T> {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick?: (row: T) => void;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[] | undefined;
  loading?: boolean;
  total?: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  rowKey: (row: T) => string;
  rowActions?: RowAction<T>[];
  toolbarTitle?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onResetFilters?: () => void;
}

export function DataTable<T extends object>({
  columns,
  data,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  rowKey,
  rowActions,
  toolbarTitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onResetFilters
}: DataTableProps<T>) {
  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    showTotal: (t) => `${t} items`,
    onChange: onPageChange
  };

  const antdColumns: ColumnsType<T> = [
    ...columns.map((col) => ({
      key: col.key,
      title: col.title,
      dataIndex: col.dataIndex ?? col.key,
      sorter: col.sortable,
      // Filters can be wired in the future based on config
      render: col.render as any
    })),
    ...(rowActions && rowActions.length
      ? [
          {
            key: "actions",
            title: "Actions",
            render: (_: unknown, record: T) => (
              <TableToolbar.ActionsDropdown actions={rowActions} record={record} />
            )
          }
        ]
      : [])
  ];

  return (
    <>
      {(onSearchChange || onResetFilters || toolbarTitle) && (
        <TableToolbar
          title={toolbarTitle}
          searchPlaceholder={searchPlaceholder}
          searchValue={searchValue ?? ""}
          onSearchChange={onSearchChange ?? (() => {})}
          onResetFilters={onResetFilters}
        />
      )}
      <Table<T>
        rowKey={rowKey}
        loading={loading}
        columns={antdColumns}
        dataSource={data}
        pagination={pagination}
      />
    </>
  );
}

