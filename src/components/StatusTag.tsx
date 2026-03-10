import { Tag } from "antd";

type TagColor =
  | "success"
  | "processing"
  | "error"
  | "warning"
  | "default"
  | "cyan"
  | "volcano";

const USER_STATUS_COLORS: Record<string, TagColor> = {
  active: "success",
  blocked: "error",
  inactive: "default",
  pending: "warning"
};

const ANNOUNCEMENT_STATUS_COLORS: Record<string, TagColor> = {
  published: "success",
  pending: "warning",
  closed: "default",
  canceled: "volcano",
  blocked: "error"
};

const APPLICATION_STATUS_COLORS: Record<string, TagColor> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  canceled: "default",
  closed: "default"
};

interface StatusTagProps {
  status: string;
  variant?: "user" | "announcement" | "application";
}

const colorMaps: Record<string, Record<string, TagColor>> = {
  user: USER_STATUS_COLORS,
  announcement: ANNOUNCEMENT_STATUS_COLORS,
  application: APPLICATION_STATUS_COLORS
};

const USER_TYPE_COLORS: Record<string, TagColor> = {
  farmer: "success",
  company: "processing",
  admin: "volcano"
};

export const StatusTag = ({ status, variant = "user" }: StatusTagProps) => {
  const map = colorMaps[variant];
  const color = map?.[status?.toLowerCase()] ?? "default";
  return <Tag color={color}>{status ?? "—"}</Tag>;
};

export const UserTypeTag = ({ userType }: { userType?: string }) => {
  const color = USER_TYPE_COLORS[userType?.toLowerCase() ?? ""] ?? "default";
  const label = userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : "—";
  return <Tag color={color}>{label}</Tag>;
};
