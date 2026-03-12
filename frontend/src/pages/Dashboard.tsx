import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Empty,
  Tag,
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import Leaderboard from "../components/Leaderboard";
import Modules from "../components/Modules";
import SideMenu from "../components/SideMenu";
import { useTheme } from "../components/ThemeContext";

const { Title, Text } = Typography;
const { Header, Content } = Layout;

interface Note {
  id: number;
  email: string;
  note_title: string;
  note_data: string;
  module: string;
  verified: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Clear stale localStorage notes from the old local-only implementation
    localStorage.removeItem("myNotes");

    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    if (!user?.email) return;

    fetch(`/api/notes/email/${encodeURIComponent(user.email)}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: { data?: Note[] }) => {
        const notes = data?.data ?? [];
        setRecentNotes(notes.slice(-3).reverse());
      })
      .catch(() => setRecentNotes([]));
  }, []);

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
          <Leaderboard onTitleClick={() => navigate("/leaderboard")} limit={5} />

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
            {recentNotes.length === 0 ? (
              <Empty description="You have no notes yet." />
            ) : (
              <Row gutter={[16, 16]}>
                {recentNotes.map((note) => (
                  <Col xs={24} sm={12} md={8} key={note.id}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/note/${note.id}`)}
                      style={{
                        borderRadius: 12,
                        boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
                        border: isDark ? "1px solid #303030" : undefined,
                        background: isDark ? "#1f1f1f" : "#fff",
                        cursor: "pointer",
                      }}
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

          {/* Modules section */}
          <Modules onTitleClick={() => navigate("/modules")} />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
