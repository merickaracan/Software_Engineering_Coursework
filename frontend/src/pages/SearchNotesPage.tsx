import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Row, Col, Typography, Card, Tag, Empty, Spin, Input, Button, message } from "antd";
import { SearchOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";
import { searchNotes } from "../api/notes";

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

const SearchNotesPage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isLecturer, setIsLecturer] = useState(false);
  const [verifyingNoteId, setVerifyingNoteId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [authorFilter, setAuthorFilter] = useState<string>("");

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await searchNotes(titleFilter, authorFilter);
      if (response.ok && response.data) {
        const notesData = Array.isArray(response.data) ? response.data : [];
        setNotes(notesData);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Error searching notes:", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [titleFilter, authorFilter]);

  useEffect(() => {
    // Load all notes initially
    handleSearch();
  }, [handleSearch]);

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : null;

      if (!user?.email) {
        setIsLecturer(false);
        return;
      }

      if (user.email === "admin" || user.role === "teacher") {
        setIsLecturer(true);
        return;
      }

      try {
        const response = await fetch(`/api/users/${encodeURIComponent(user.email)}`, {
          credentials: "include",
        });
        const data = await response.json();
        const userData = data?.ok && Array.isArray(data.data) ? data.data[0] : null;
        setIsLecturer(Number(userData?.lecturer ?? 0) === 1);
      } catch {
        setIsLecturer(false);
      }
    };

    fetchCurrentUserRole();
  }, []);

  const handleVerifyToggle = async (noteId: string, currentlyVerified: number) => {
    const endpoint = Number(currentlyVerified) === 1 ? `/api/notes/unverify/${noteId}` : `/api/notes/verify/${noteId}`;

    try {
      setVerifyingNoteId(noteId);
      const response = await fetch(endpoint, {
        method: "PUT",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        message.error(data?.error || data?.message || "Failed to update verification status");
        return;
      }

      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, is_verified: Number(note.is_verified) === 1 ? 0 : 1 }
            : note
        )
      );
      message.success(Number(currentlyVerified) === 1 ? "Note marked as unverified" : "Note marked as teacher verified");
    } catch {
      message.error("Failed to update verification status");
    } finally {
      setVerifyingNoteId(null);
    }
  };

  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <section>
          <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <SearchOutlined style={{ fontSize: 26, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 12 }} />
              <Title level={2} style={{ margin: 0 }}>Search Notes</Title>
            </div>
          </Row>

          {/* Search Filters */}
          <Card
            style={{
              marginBottom: 24,
              borderRadius: 12,
              boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
              border: isDark ? "1px solid #303030" : undefined,
              background: isDark ? "#1f1f1f" : "#fff",
            }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12}>
                <div>
                  <Text strong style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
                    Title
                  </Text>
                  <Input
                    placeholder="Search by note title..."
                    value={titleFilter}
                    onChange={(e) => setTitleFilter(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ borderRadius: 8 }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <Text strong style={{ fontSize: 14, display: "block", marginBottom: 8 }}>
                    Author Email
                  </Text>
                  <Input
                    placeholder="Search by author email..."
                    value={authorFilter}
                    onChange={(e) => setAuthorFilter(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ borderRadius: 8 }}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          {/* Notes Display */}
          {notes.length === 0 && !loading ? (
            <Empty description={titleFilter || authorFilter ? "No notes found matching your search." : "No notes available."} style={{ marginTop: 48 }} />
          ) : (
            <Spin spinning={loading} description="Searching notes...">
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
                        minHeight: 180,
                        cursor: "pointer",
                      }}
                    >
                      <Title level={5} style={{ marginBottom: 6 }}>
                        {note.title}
                      </Title>
                      {Number(note.is_verified) === 1 && (
                        <Tag
                          color="green"
                          icon={<SafetyCertificateOutlined />}
                          style={{ borderRadius: 6, marginBottom: 8 }}
                        >
                          Teacher Verified
                        </Tag>
                      )}
                      <Tag color="blue" style={{ borderRadius: 6, marginBottom: 8 }}>
                        {MODULE_LABELS[note.module] ?? note.module}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
                        by {note.owner_email}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
                        {note.note_data
                          ? note.note_data.length > 80
                            ? note.note_data.slice(0, 80) + "…"
                            : note.note_data
                          : "No description."}
                      </Text>

                      {isLecturer && (
                        <Button
                          type={Number(note.is_verified) === 1 ? "default" : "primary"}
                          size="small"
                          icon={<SafetyCertificateOutlined />}
                          loading={verifyingNoteId === note.id}
                          style={{ marginTop: 12, borderRadius: 6 }}
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleVerifyToggle(note.id, Number(note.is_verified));
                          }}
                        >
                          {Number(note.is_verified) === 1 ? "Unverify" : "Verify"}
                        </Button>
                      )}
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

export default SearchNotesPage;
