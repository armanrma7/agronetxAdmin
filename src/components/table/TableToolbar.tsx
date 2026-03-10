import { Button, Space, Dropdown, MenuProps } from "antd";
import { ReloadOutlined, MoreOutlined } from "@ant-design/icons";
import type { RowAction } from "./DataTable";

interface TableToolbarProps {
  onResetFilters?: () => void;
}

export const TableToolbar = ({
  onResetFilters
}: TableToolbarProps) => {


  return (
    <div
      style={{
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <Space>
        {/* {onResetFilters && (
          <Button icon={<ReloadOutlined />} onClick={onResetFilters}>
            Reset
          </Button>
        )} */}
      </Space>
    </div>
  );
};

interface ActionsDropdownProps<T> {
  actions: RowAction<T>[];
  record: T;
}

const ActionsDropdownInner = <T,>({ actions, record }: ActionsDropdownProps<T>) => {
  const items: MenuProps["items"] = actions.map((action) => ({
    key: action.key,
    danger: action.danger,
    label: action.label,
    icon: action.icon,
    onClick: () => action.onClick?.(record)
  }));

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Button icon={<MoreOutlined />} />
    </Dropdown>
  );
};

TableToolbar.ActionsDropdown = ActionsDropdownInner as <T,>(
  props: ActionsDropdownProps<T>
) => JSX.Element;

