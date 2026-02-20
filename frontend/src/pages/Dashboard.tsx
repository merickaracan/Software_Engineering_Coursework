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
  ShareAltOutlined
} from "@ant-design/icons";

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

  const onSearch = (value: string) => {
    console.log(value);
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f0f5ff", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <Header
        style={{
          background: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Title level={4} style={{margin: "0 50px", color: "#0b5ed7" }}>
          Notebuddy
        </Title>
        <Search style={{ width: 500 }} placeholder="input search text" onSearch={onSearch} enterButton />
        <Avatar
          size={40}
          icon={<UserOutlined />}
          style={{ backgroundColor: "#0b5ed7", cursor: "pointer", marginLeft: "auto", marginRight: 16 }}
          onClick={() => navigate("/profile")}
        />
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
    </Layout>
  );
};

export default Dashboard;
