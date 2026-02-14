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
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f5ff" }}>
      {/* Top bar */}
      <Header
        style={{
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Title level={4} style={{ margin: 0, color: "#0b5ed7" }}>
          Notebuddy
        </Title>
        <Avatar
          size={40}
          icon={<UserOutlined />}
          style={{ backgroundColor: "#0b5ed7", cursor: "pointer" }}
          onClick={() => navigate("/profile")}
        />
      </Header>

      {/* Main content */}
      <Content style={{ padding: "32px" }}>
        {/* My Notes section */}
        <section style={{ marginBottom: 48 }}>
          <Row align="middle" style={{ marginBottom: 16 }}>
            <FileTextOutlined style={{ fontSize: 22, color: "#0b5ed7", marginRight: 10 }} />
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
                    boxShadow: "0 4px 12px rgba(15,35,95,0.08)",
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

        {/* Shared Notes section */}
        <section>
          <Row align="middle" style={{ marginBottom: 16 }}>
            <ShareAltOutlined style={{ fontSize: 22, color: "#0b5ed7", marginRight: 10 }} />
            <Title level={3} style={{ margin: 0 }}>Shared Notes</Title>
          </Row>
          <Row gutter={[16, 16]}>
            {[1, 2, 3].map((i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(15,35,95,0.08)",
                  }}
                >
                  <Title level={5} style={{ marginBottom: 4 }}>
                    Shared Note {i}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    This is a placeholder for shared note content.
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </section>
      </Content>
    </Layout>
  );
};

export default Dashboard;
