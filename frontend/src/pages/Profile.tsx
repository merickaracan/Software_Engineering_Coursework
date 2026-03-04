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
  Empty,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LogoutOutlined,
  BookOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";

const { Title, Text } = Typography;
const { Content } = Layout;

const AVAILABLE_MODULES: Record<string, { name: string; code: string }> = {
  se: { name: "Software Engineering", code: "CM50109" },
  ml: { name: "Machine Learning", code: "CM50264" },
  sa: { name: "Systems Architecture", code: "CM50123" },
  vc: { name: "Visual Computing", code: "CM50275" },
  db: { name: "Databases", code: "CM50202" },
  ai: { name: "Artificial Intelligence", code: "CM50170" },
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;

  const name = user?.name ?? "No name set";
  const email = user?.email ?? "No email set";
  const major = user?.major ?? null;

  const storedModules = localStorage.getItem("selectedModules");
  const selectedIds: string[] = storedModules ? JSON.parse(storedModules) : [];
  const selectedModules = selectedIds
    .map((id) => AVAILABLE_MODULES[id])
    .filter(Boolean);

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
              {major && (
                <Tag color="blue" style={{ marginTop: 10, borderRadius: 6, fontSize: 13, padding: "2px 12px" }}>
                  {major}
                </Tag>
              )}
            </Card>

            {/* Student details */}
            <Card title="Student Details" style={cardStyle}>
              <Descriptions column={1} colon={false}>
                <Descriptions.Item
                  label={<><UserOutlined style={{ marginRight: 8 }} />Name</>}
                >
                  {name}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<><MailOutlined style={{ marginRight: 8 }} />Email</>}
                >
                  {email}
                </Descriptions.Item>
                {major && (
                  <Descriptions.Item
                    label={<><BookOutlined style={{ marginRight: 8 }} />Major</>}
                  >
                    {major}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Modules */}
            <Card title="My Modules" style={cardStyle}>
              {selectedModules.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selectedModules.map((mod) => (
                    <Tag key={mod.code} color="blue" style={{ borderRadius: 6, fontSize: 13, padding: "2px 10px" }}>
                      {mod.name}
                      <Text type="secondary" style={{ fontSize: 11, marginLeft: 6 }}>
                        {mod.code}
                      </Text>
                    </Tag>
                  ))}
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span>
                      No modules selected.{" "}
                      <a
                        onClick={() => navigate("/modules")}
                        style={{ color: isDark ? "#4da3ff" : "#0b5ed7", cursor: "pointer" }}
                      >
                        Go to Modules
                      </a>{" "}
                      to enrol.
                    </span>
                  }
                />
              )}
            </Card>

            {/* Actions */}
            <Card style={{ ...cardStyle, marginBottom: 0 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{ backgroundColor: "#0b5ed7", borderColor: "#0b5ed7", borderRadius: 8 }}
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
