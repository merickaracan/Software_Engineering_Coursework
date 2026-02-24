import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Empty,
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import Leaderboard from "../Components/Leaderboard";
import Modules from "../Components/Modules";
import SideMenu from "../Components/SideMenu";
import { useTheme } from "../Components/ThemeContext";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <SideMenu />
      <Layout style={{ background: isDark ? "#141414" : "#f0f5ff" }}>
        {/* Top bar */}
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

        {/* Main content */}
        <Content style={{ padding: "32px" }}>
          {/* Leaderboard section */}
          <Leaderboard onTitleClick={() => navigate("/leaderboard")} />

          {/* My Notes section */}
          <section style={{ marginBottom: 48 }}>
            <Row align="middle" style={{ marginBottom: 16 }}>
              <FileTextOutlined style={{ fontSize: 22, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 10 }} />
              <Title
                level={3}
                style={{ margin: 0, cursor: "pointer" }}
                onClick={() => navigate("/my-notes")}
              >
                My Notes
              </Title>
            </Row>
            <Row gutter={[16, 16]}>
              {[1, 2, 3].map((i) => (
                <Col xs={24} sm={12} md={8} key={i}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 12,
                      boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
                      border: isDark ? "1px solid #303030" : undefined,
                      background: isDark ? "#1f1f1f" : "#fff",
                    }}
                  >
                    <Title level={5} style={{ marginBottom: 4 }}>
                      Note {i}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      This is a placeholder for note content. Replace with real data.
                    </Text>
                  </Card>
                </Col>
              ))}
              {false && (
                <Col span={24}>
                  <Empty description="You have no notes yet." />
                </Col>
              )}
            </Row>
          </section>

          {/* Modules section */}
          <Modules onTitleClick={() => navigate("/modules")} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
