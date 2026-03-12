import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Tag,
  Empty,
  Spin,
  Button,
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  CheckCircleOutlined,
  StarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";
import { AVAILABLE_MODULES } from "../components/Modules";
import { getNotesByModule } from "../api/notes.js";

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

const ModuleNotesPage: React.FC = () => {
  const { moduleCode } = useParams<{ moduleCode: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const moduleInfo = AVAILABLE_MODULES.find((m) => m.code === moduleCode);

  useEffect(() => {
    if (!moduleCode) return;
    setLoading(true);
    getNotesByModule(moduleCode)
      .then((data: { data?: Note[] }) => {
        setNotes(data?.data ?? []);
      })
      .catch(() => setError("Failed to load notes. Please try again."))
      .finally(() => setLoading(false));
  }, [moduleCode]);

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: isDark
      ? "0 4px 12px rgba(0,0,0,0.3)"
      : "0 4px 12px rgba(15,35,95,0.08)",
    border: isDark ? "1px solid #303030" : undefined,
    background: isDark ? "#1f1f1f" : "#fff",
  };

  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <div style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/modules")}
            style={{ marginBottom: 16, borderRadius: 8 }}
          >
            Back to Modules
          </Button>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BookOutlined
              style={{ fontSize: 26, color: isDark ? "#4da3ff" : "#0b5ed7" }}
            />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {moduleInfo?.name ?? moduleCode}
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {moduleCode}
                {moduleInfo ? ` · Year ${moduleInfo.year}` : ""}
              </Text>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Empty description={error} />
        ) : notes.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No notes have been shared for this module yet."
            style={{ marginTop: 48 }}
          />
        ) : (
          <>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 16, fontSize: 14 }}
            >
              {notes.length} {notes.length === 1 ? "note" : "notes"} found
            </Text>
            <Row gutter={[16, 16]}>
              {notes.map((note) => (
                <Col xs={24} sm={12} md={8} key={note.id}>
                  <Card
                    hoverable
                    onClick={() => navigate(`/note/${note.id}`)}
                    style={{ ...cardStyle, cursor: "pointer", minHeight: 160 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <FileTextOutlined
                        style={{
                          fontSize: 18,
                          color: isDark ? "#4da3ff" : "#0b5ed7",
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      />
                      <Title level={5} style={{ margin: 0, lineHeight: 1.4 }}>
                        {note.note_title || "Untitled Note"}
                      </Title>
                    </div>

                    <Text
                      type="secondary"
                      style={{ fontSize: 12, display: "block", marginBottom: 10 }}
                    >
                      By {note.email}
                    </Text>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      {note.verified ? (
                        <Tag
                          icon={<CheckCircleOutlined />}
                          color="success"
                          style={{ borderRadius: 6 }}
                        >
                          Verified
                        </Tag>
                      ) : (
                        <Tag color="default" style={{ borderRadius: 6 }}>
                          Unverified
                        </Tag>
                      )}
                      {note.number_ratings > 0 && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <StarOutlined style={{ marginRight: 4 }} />
                          {Number(note.rating_average).toFixed(1)} ({note.number_ratings})
                        </Text>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Content>
    </PageLayout>
  );
};

export default ModuleNotesPage;
