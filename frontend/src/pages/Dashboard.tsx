import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Avatar,
  Empty,
  Input,
  Button,
  Space,
  Tag,
  List
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import Leaderboard from "../components/Leaderboard";
import Modules from "../components/Modules";
import { useTheme } from "../components/ThemeContext";

const { Title, Text } = Typography;
const { Header, Sider, Content } = Layout;
const { Search } = Input;

const recentNotes = [
  {
    title: "Urban Ecology Study",
    updated: "Updated 2 min ago",
    tags: ["Research", "Spring"],
  },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const onSearch = (value: string) => {
    console.log(value);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: isDark ? "#141414" : "#f0f5ff" }}>
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
        <div style={{ position: "absolute", right: 32, display: "flex", alignItems: "center", gap: 12 }}>
          <div
            onClick={toggleTheme}
            style={{
              cursor: "pointer",
              fontSize: 20,
              color: "#fff",
              display: "flex",
              alignItems: "center",
            }}
          >
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </div>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#0b5ed7", cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          />
        </div>
      </Header>
      
      <Layout hasSider={true}>
      {/* Sidebar content */}
      <Sider width={320} style={{ background: "transparent", padding: "24px 0 24px 24px" }}>
        <Card
          style={{ borderRadius: 16, boxShadow: "0 18px 40px rgba(15,35,95,0.12)" }}
        >
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <Space align="center">
              <Avatar
                size={46}
                style={{ backgroundColor: "#0b5ed7", fontWeight: 700 }}
              >
                NB
              </Avatar>
              <Space orientation="vertical" size={0}>
                <Text strong style={{ fontSize: 16 }}>
                  Student Name
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Course Name
                </Text>
              </Space>
            </Space>

            <Button type="primary" block onClick={() => navigate("/notes")}>
              + New note
            </Button>

            <Input placeholder="Search personal notes" aria-label="Search personal notes" />

            <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
              <Text type="secondary" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
                Recent notes
              </Text>
              <Tag color="purple">12</Tag>
            </Space>

            <List
              dataSource={recentNotes}
              renderItem={(note, index) => (
                <List.Item style={{ paddingInline: 0 }}>
                  <Card
                    hoverable
                    style={{ width: "100%", borderRadius: 12 }}
                    bodyStyle={{ padding: 12 }}
                    onClick={() => navigate("/notes")}
                  >
                    <Space orientation="vertical" size={6} style={{ width: "100%" }}>
                      <Text strong>{note.title}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {note.updated}
                      </Text>
                      <Space wrap>
                        {note.tags.map((tag) => (
                          <Tag key={`${note.title}-${tag}`}>{tag}</Tag>
                        ))}
                        {index === 0 && <Tag color="blue">Active</Tag>}
                      </Space>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </Space>
        </Card>
      </Sider>

      {/* Main content */}
      <Content style={{ padding: "32px" }}>
        {/* Leaderboard section */}
        <Leaderboard />

        {/* My Notes section */}
        <section style={{ marginBottom: 48 }}>
          <Row align="middle" style={{ marginBottom: 16 }}>
            <FileTextOutlined style={{ fontSize: 22, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 10 }} />
            <Title level={3} style={{ margin: 0 }}>My Notes</Title>
          </Row>
          <Row gutter={[16, 16]}>
            {/* Placeholder cards – replace with real data later */}
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
            {/* Empty state if no notes */}
            {false && (
              <Col span={24}>
                <Empty description="You have no notes yet." />
              </Col>
            )}
          </Row>
        </section>

        {/* Modules section */}
        <Modules />
      </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
