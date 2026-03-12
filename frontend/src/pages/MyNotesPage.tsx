import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Row, Col, Typography, Card, Tag, Empty, Spin, Button } from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";

const { Title, Text } = Typography;
const { Content } = Layout;

interface Note {
  id: number;
  email: string;
  verified: number;
  note_data: string;
  rating_average: number;
  number_ratings: number;
  module: string;
  note_title: string;
}

const MyNotesPage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    if (!user?.email) {
      setLoading(false);
      return;
    }

    fetch(`/api/notes/email/${encodeURIComponent(user.email)}`, {
        credentials: "include",
      })
      .then((res) => res.json())
      .then((data: { data?: Note[] }) => setNotes(data?.data ?? []))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, []);

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
    border: isDark ? "1px solid #303030" : undefined,
    background: isDark ? "#1f1f1f" : "#fff",
    minHeight: 150,
    cursor: "pointer",
  };

  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <section>
          <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <FileTextOutlined
                style={{ fontSize: 26, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 12 }}
              />
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

          {loading ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <Spin size="large" />
            </div>
          ) : notes.length === 0 ? (
            <Empty description="You have no notes yet." style={{ marginTop: 48 }} />
          ) : (
            <Row gutter={[16, 16]}>
              {notes.map((note) => (
                <Col xs={24} sm={12} md={8} key={note.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/note/${note.id}`)}
                    style={cardStyle}
                  >
                    <Title level={5} style={{ marginBottom: 6 }}>
                      {note.note_title || "Untitled Note"}
                    </Title>
                    <Tag color="blue" style={{ borderRadius: 6, marginBottom: 8 }}>
                      {note.module}
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
          )}
        </section>
      </Content>
    </PageLayout>
  );
};

export default MyNotesPage;
