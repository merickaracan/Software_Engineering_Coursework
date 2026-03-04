import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Typography, message } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined,
  PlusOutlined,
  DashboardOutlined,
  TrophyOutlined,
  FileTextOutlined,
  BookOutlined,
  LogoutOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useTheme } from "./ThemeContext";
import { logout } from "../api/auth";

const { Sider } = Layout;
const { Text } = Typography;

const SideMenu: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      localStorage.removeItem("user");
      message.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      // Still clear local storage even if logout fails
      localStorage.removeItem("user");
      message.success("Logged out successfully");
      navigate("/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  const currentKey = (() => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path === "/leaderboard") return "leaderboard";
    if (path === "/my-notes") return "my-notes";
    if (path === "/search-notes") return "search-notes";
    if (path === "/modules") return "modules";
    if (path === "/profile") return "profile";
    return "dashboard";
  })();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "leaderboard",
      icon: <TrophyOutlined />,
      label: "Leaderboard",
      onClick: () => navigate("/leaderboard"),
    },
    {
      key: "my-notes",
      icon: <FileTextOutlined />,
      label: "My Notes",
      onClick: () => navigate("/my-notes"),
    },
    {
      key: "search-notes",
      icon: <SearchOutlined />,
      label: "Search Notes",
      onClick: () => navigate("/search-notes"),
    },
    {
      key: "modules",
      icon: <BookOutlined />,
      label: "Modules",
      onClick: () => navigate("/modules"),
    },
    { type: "divider" as const },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      width={220}
      collapsedWidth={64}
      style={{
        background: isDark ? "#1f1f1f" : "#fff",
        borderRight: isDark ? "1px solid #303030" : "1px solid #e8e8e8",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
      }}
    >
      {/* Collapse toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? "16px 0" : "16px 20px",
          borderBottom: isDark ? "1px solid #303030" : "1px solid #e8e8e8",
        }}
      >
        {!collapsed && (
          <Text strong style={{ fontSize: 16, color: isDark ? "#4da3ff" : "#0b5ed7" }}>
            Notebuddy
          </Text>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ color: isDark ? "#fff" : "#333" }}
        />
      </div>

      {/* Create Note button */}
      <div style={{ padding: collapsed ? "12px 8px" : "12px 16px" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          block
          size={collapsed ? "middle" : "large"}
          style={{
            backgroundColor: isDark ? "#4da3ff" : "#0b5ed7",
            borderColor: isDark ? "#4da3ff" : "#0b5ed7",
            borderRadius: 8,
          }}
          onClick={() => navigate("/create-note")}
        >
          {!collapsed && "Create Note"}
        </Button>
      </div>

      {/* Navigation */}
      <Menu
        mode="inline"
        selectedKeys={[currentKey]}
        items={menuItems}
        style={{
          background: "transparent",
          borderRight: "none",
          flex: 1,
        }}
      />

      {/* Bottom actions */}
      <div
        style={{
          borderTop: isDark ? "1px solid #303030" : "1px solid #e8e8e8",
          padding: collapsed ? "12px 8px" : "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          block
          onClick={toggleTheme}
          style={{
            textAlign: "left",
            color: isDark ? "#fff" : "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          {!collapsed && (isDark ? "Light Mode" : "Dark Mode")}
        </Button>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          block
          danger
          loading={logoutLoading}
          onClick={handleLogout}
          style={{
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          {!collapsed && "Log Out"}
        </Button>
      </div>
    </Sider>
  );
};

export default SideMenu;
