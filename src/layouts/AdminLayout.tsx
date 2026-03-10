import { Layout, Menu, Breadcrumb, Dropdown, Space, Typography } from "antd";
import {
  AppstoreOutlined,
  NotificationOutlined,
  UserOutlined,
  BarChartOutlined,
  StarOutlined,
  MobileOutlined,
  EnvironmentOutlined,
  TagsOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useMemo } from "react";
import { useAuth } from "../state/auth/useAuth";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

interface MenuItemConfig {
  key: string;
  label: ReactNode;
  icon: ReactNode;
  path: string;
}

const menuItems: MenuItemConfig[] = [
  { key: "dashboard", label: "Dashboard", icon: <BarChartOutlined />, path: "/" },
  { key: "users", label: "Users", icon: <UserOutlined />, path: "/users" },
  { key: "announcements", label: "Announcements", icon: <NotificationOutlined />, path: "/announcements" },
  { key: "applications", label: "Applications", icon: <AppstoreOutlined />, path: "/applications" },
  { key: "favorites", label: "Favorites", icon: <StarOutlined />, path: "/favorites" },
  { key: "devices", label: "Devices", icon: <MobileOutlined />, path: "/devices" },
  { key: "categories", label: "Categories", icon: <TagsOutlined />, path: "/categories" }
];

const pathToKey = (pathname: string): string => {
  if (pathname === "/") return "dashboard";
  const found = menuItems.find((item) => pathname.startsWith(item.path) && item.path !== "/");
  return found?.key ?? "dashboard";
};

const buildBreadcrumbItems = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const items = [{ title: <Link to="/">Dashboard</Link> }];
  if (segments.length === 0) return items;
  const [first] = segments;
  if (first) {
    const match = menuItems.find((m) => m.path === `/${first}`);
    if (match) {
      items.push({ title: match.label });
    }
  }
  return items;
};

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const selectedKey = useMemo(() => pathToKey(location.pathname), [location.pathname]);
  const breadcrumbItems = useMemo(() => buildBreadcrumbItems(location.pathname), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="64">
        <div
          style={{
            height: 48,
            margin: 12,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 18
          }}
        >
          Agonetix
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link to={item.path}>{item.label}</Link>
          }))}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Admin Dashboard
          </Title>
          <Dropdown
            menu={{
              items: userMenuItems
            }}
          >
            <Space style={{ cursor: "pointer" }}>
              <UserOutlined />
              <span>{user?.fullName ?? user?.phone ?? "Admin"}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: "16px 24px" }}>
          <Breadcrumb items={breadcrumbItems} />
          <div style={{ marginTop: 16, padding: 24, background: "#fff", minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

