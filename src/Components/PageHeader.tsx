import React from "react";
import { Layout, Typography } from "antd";
import SideMenu from "./SideMenu";
import { useTheme } from "./ThemeContext";

const { Title } = Typography;
const { Header } = Layout;

interface PageHeaderProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageHeaderProps> = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <SideMenu />
      <Layout style={{ background: isDark ? "#141414" : "#f0f5ff" }}>
        <Header
          style={{
            background: isDark ? "#1a3a6e" : "#0b5ed7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 32px",
            height: 80,
            boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Title level={4} style={{ margin: 0, color: "#fff" }}>
            Notebuddy
          </Title>
        </Header>
        {children}
      </Layout>
    </Layout>
  );
};

export default PageLayout;
