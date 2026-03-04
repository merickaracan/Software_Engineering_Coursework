import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Row, Col, Typography, Card, Tag, Empty, Spin, Input } from "antd";
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
            <Spin spinning={loading} tip="Searching notes...">
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
                      {note.is_verified === 1 && (
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
