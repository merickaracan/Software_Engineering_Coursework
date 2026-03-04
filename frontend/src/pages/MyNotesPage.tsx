import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Row, Col, Typography, Card, Tag, Empty, Spin } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";
import { getNotesByEmail } from "../api/notes";

const { Title, Text } = Typography;
const { Content } = Layout;

interface Note {
  id: string;
  owner_id: number;
  owner_email: string;
  title: string;
  note_data: string;
  module: string;
  is_verified: number;
  created_at: string;
  updated_at: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;

        if (!currentUser || !currentUser.email) {
          setNotes([]);
          setLoading(false);
          return;
        }

        const response = await getNotesByEmail(currentUser.email);
        
        if (response.ok && response.data) {
          const notes = Array.isArray(response.data) ? response.data : [];
          setNotes(notes);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
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
            <Spin spinning={loading} tip="Loading notes...">
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
                      {note.note_data
                        ? note.note_data.length > 80
                          ? note.note_data.slice(0, 80) + "…"
                          : note.note_data
                          : "No description."}
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Spin>
          )}
        </section>
      </Content>
    </PageLayout>
  );
};

export default MyNotesPage;
