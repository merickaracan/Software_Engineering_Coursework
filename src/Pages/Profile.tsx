import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Avatar,
  Descriptions,
  Tag,
  Button,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import PageLayout from "../Components/PageHeader";
import { useTheme } from "../Components/ThemeContext";

const { Title, Text } = Typography;
const { Content } = Layout;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;

  const name = user?.name ?? "No name set";
  const email = user?.email ?? "No email set";

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
    border: isDark ? "1px solid #303030" : undefined,
    background: isDark ? "#1f1f1f" : "#fff",
    marginBottom: 24,
  };

  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <Row justify="center">
          <Col xs={24} md={18} lg={14}>
            {/* Profile header card */}
            <Card
              style={cardStyle}
              bodyStyle={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "32px",
              }}
            >
              <Avatar
                size={96}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#0b5ed7", marginBottom: 16 }}
              />
              <Title level={3} style={{ margin: 0 }}>
                {name}
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {email}
              </Text>
            </Card>

            {/* Student details */}
            <Card title="Student Details" style={cardStyle}>
              <Descriptions column={1} colon={false}>
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined style={{ marginRight: 8 }} />
                      Name
                    </>
                  }
                >
                  {name}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <MailOutlined style={{ marginRight: 8 }} />
                      Email
                    </>
                  }
                >
                  {email}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Modules */}
            <Card title="Modules" style={cardStyle}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Tag color="blue">Software Engineering</Tag>
                <Tag color="blue">Machine Learning</Tag>
                <Tag color="blue">Systems Architecture</Tag>
                <Tag color="blue">Visual Computing</Tag>
                <Tag color="blue">Databases</Tag>
              </div>
            </Card>

            {/* Actions */}
            <Card style={{ ...cardStyle, marginBottom: 0 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{
                      backgroundColor: "#0b5ed7",
                      borderColor: "#0b5ed7",
                      borderRadius: 8,
                    }}
                    onClick={() => navigate("/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                </Col>
                <Col xs={24} sm={12}>
                  <Button
                    danger
                    block
                    size="large"
                    icon={<LogoutOutlined />}
                    style={{ borderRadius: 8 }}
                    onClick={() => {
                      localStorage.removeItem("user");
                      navigate("/login");
                    }}
                  >
                    Log out
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Content>
    </PageLayout>
  );
};

export default Profile;
