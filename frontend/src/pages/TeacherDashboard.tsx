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
  Button,
  message,
  Space,
} from "antd";
import { FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
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

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetch("/api/notes", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { data?: Note[] }) => {
        setNotes(data?.data ?? []);
      })
      .catch(() => setNotes([]));
  }, []);

  const handleVerify = async (e: React.MouseEvent, noteId: number, currentlyVerified: number) => {
    e.stopPropagation();
    const endpoint = currentlyVerified ? `/api/notes/unverify/${noteId}` : `/api/notes/verify/${noteId}`;
    try {
      const res = await fetch(endpoint, { method: "PUT", credentials: "include" });
      const data = await res.json();
      if (data.ok) {
        message.success(currentlyVerified ? "Note unverified." : "Note verified.");
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, verified: currentlyVerified ? 0 : 1 } : n))
        );
      } else {
        message.error(data.error || "Action failed.");
      }
    } catch {
      message.error("Network error.");
    }
  };

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
            Notebuddy — Teacher View
          </Title>
        </Header>

        {/* Main content */}
        <Content style={{ padding: "32px" }}>
          {/* Leaderboard section */}
          <Leaderboard onTitleClick={() => navigate("/leaderboard")} limit={5} />

          {/* All Student Notes section */}
          <section style={{ marginBottom: 48 }}>
            <Row align="middle" style={{ marginBottom: 16 }}>
              <FileTextOutlined
                style={{ fontSize: 22, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 10 }}
              />
              <Title level={3} style={{ margin: 0 }}>
                All Student Notes
              </Title>
            </Row>
            {notes.length === 0 ? (
              <Empty description="No notes uploaded yet." />
            ) : (
              <Row gutter={[16, 16]}>
                {notes.map((note) => (
                  <Col xs={24} sm={12} md={8} key={note.id}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/note/${note.id}`)}
                      style={{
                        borderRadius: 12,
                        boxShadow: isDark
                          ? "0 4px 12px rgba(0,0,0,0.3)"
                          : "0 4px 12px rgba(15,35,95,0.08)",
                        border: isDark ? "1px solid #303030" : undefined,
                        background: isDark ? "#1f1f1f" : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <Title level={5} style={{ marginBottom: 6 }}>
                        {note.note_title || "Untitled Note"}
                      </Title>
                      <Space size="small" wrap style={{ marginBottom: 8 }}>
                        <Tag color="blue" style={{ borderRadius: 6 }}>
                          {note.module}
                        </Tag>
                        {note.verified ? (
                          <Tag color="success" icon={<CheckCircleOutlined />}>
                            Verified
                          </Tag>
                        ) : (
                          <Tag color="warning">Pending</Tag>
                        )}
                      </Space>
                      <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 12 }}>
                        {note.note_data
                          ? note.note_data.length > 80
                            ? note.note_data.slice(0, 80) + "…"
                            : note.note_data
                          : "No description."}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 10 }}>
                        By {note.email}
                      </Text>
                      <Button
                        size="small"
                        type={note.verified ? "default" : "primary"}
                        danger={note.verified ? true : false}
                        icon={note.verified ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                        onClick={(e) => handleVerify(e, note.id, note.verified)}
                        style={{ borderRadius: 6, width: "100%" }}
                      >
                        {note.verified ? "Unverify" : "Verify"}
                      </Button>
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

export default TeacherDashboard;
