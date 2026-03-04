import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Row, Col, Typography, Card, Tag, Empty } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";

const { Title, Text } = Typography;
const { Content } = Layout;

interface Note {
  id: string;
  title: string;
  description: string;
  module: string;
  files: string[];
  createdAt: string;
}

const MODULE_LABELS: Record<string, string> = {
  se: "Software Engineering",
  ml: "Machine Learning",
  sa: "Systems Architecture",
  vc: "Visual Computing",
  db: "Databases",
  ai: "Artificial Intelligence",
};

const MyNotesPage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("myNotes");
    setNotes(stored ? JSON.parse(stored) : []);
  }, []);

  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <section>
          <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <FileTextOutlined style={{ fontSize: 26, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 12 }} />
              <Title level={2} style={{ margin: 0 }}>My Notes</Title>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/create-note")}
              style={{ backgroundColor: isDark ? "#4da3ff" : "#0b5ed7", borderRadius: 8 }}
            >
              Create Note
            </Button>
          </Row>
          {notes.length === 0 ? (
            <Empty description="You have no notes yet." style={{ marginTop: 48 }} />
          ) : (
            <Row gutter={[16, 16]}>
              {notes.map((note) => (
                <Col xs={24} sm={12} md={8} key={note.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/note/${note.id}`)}
                    style={{
                      borderRadius: 12,
                      boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
                      border: isDark ? "1px solid #303030" : undefined,
                      background: isDark ? "#1f1f1f" : "#fff",
                      minHeight: 150,
                      cursor: "pointer",
                    }}
                  >
                    <Title level={5} style={{ marginBottom: 6 }}>
                      {note.title}
                    </Title>
                    <Tag color="blue" style={{ borderRadius: 6, marginBottom: 8 }}>
                      {MODULE_LABELS[note.module] ?? note.module}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
                      {note.description
                        ? note.description.length > 80
                          ? note.description.slice(0, 80) + "…"
                          : note.description
                        : "No description."}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </section>
      </Content>
    </PageLayout>
  );
};

export default MyNotesPage;
