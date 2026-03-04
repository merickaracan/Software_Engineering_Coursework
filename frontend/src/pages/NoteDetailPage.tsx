import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Tag,
  Button,
  Empty,
  List,
  Space,
  Popconfirm,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import PageLayout from "../Components/PageHeader";
import { useTheme } from "../Components/ThemeContext";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

interface Note {
  id: string;
  title: string;
  description: string;
  module: string;
  files: string[];
  createdAt: string;
  ownerEmail: string;
}

const MODULE_LABELS: Record<string, string> = {
  se: "Software Engineering",
  ml: "Machine Learning",
  sa: "Systems Architecture",
  vc: "Visual Computing",
  db: "Databases",
  ai: "Artificial Intelligence",
};

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [note, setNote] = useState<Note | null | undefined>(undefined);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("myNotes");
    const notes: Note[] = stored ? JSON.parse(stored) : [];
    const found = notes.find((n) => n.id === id) ?? null;
    setNote(found);

    if (found) {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      // If ownerEmail is absent (note predates ownership feature), any logged-in user can edit
      setIsOwner(!found.ownerEmail || currentUser?.email === found.ownerEmail);
    }
  }, [id]);

  const handleDelete = () => {
    const stored = localStorage.getItem("myNotes");
    const notes: Note[] = stored ? JSON.parse(stored) : [];
    localStorage.setItem("myNotes", JSON.stringify(notes.filter((n) => n.id !== id)));
    message.success("Note deleted.");
    navigate("/my-notes");
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
    border: isDark ? "1px solid #303030" : undefined,
    background: isDark ? "#1f1f1f" : "#fff",
    marginBottom: 24,
  };

  if (note === null) {
    return (
      <PageLayout>
        <Content style={{ padding: "32px" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/my-notes")}
            style={{ marginBottom: 24, borderRadius: 8 }}
          >
            Back to My Notes
          </Button>
          <Empty description="Note not found." />
        </Content>
      </PageLayout>
    );
  }


  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <Space style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/my-notes")}
            style={{ borderRadius: 8 }}
          >
            Back to My Notes
          </Button>
          {isOwner && (
            <>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/note/${id}/edit`)}
                style={{
                  backgroundColor: isDark ? "#4da3ff" : "#0b5ed7",
                  borderColor: isDark ? "#4da3ff" : "#0b5ed7",
                  borderRadius: 8,
                }}
              >
                Edit Note
              </Button>
              <Popconfirm
                title="Delete this note?"
                description="This action cannot be undone."
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
                onConfirm={handleDelete}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  style={{ borderRadius: 8 }}
                >
                  Delete Note
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>

        {note && (
          <>
            {/* Title & module */}
            <Card style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FileTextOutlined style={{ fontSize: 28, color: isDark ? "#4da3ff" : "#0b5ed7" }} />
                <Title level={2} style={{ margin: 0 }}>
                  {note.title}
                </Title>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
                <Tag color="blue" style={{ borderRadius: 6, fontSize: 13, padding: "2px 10px" }}>
                  {MODULE_LABELS[note.module] ?? note.module}
                </Tag>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <CalendarOutlined style={{ marginRight: 6 }} />
                  {new Date(note.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </div>
            </Card>

            {/* Description */}
            <Card title="Description" style={cardStyle}>
              {note.description ? (
                <Paragraph style={{ fontSize: 15, margin: 0 }}>
                  {note.description}
                </Paragraph>
              ) : (
                <Text type="secondary">No description provided.</Text>
              )}
            </Card>

            {/* Attached files */}
            {note.files.length > 0 && (
              <Card
                title={
                  <span>
                    <PaperClipOutlined style={{ marginRight: 8 }} />
                    Attached Files
                  </span>
                }
                style={cardStyle}
              >
                <List
                  dataSource={note.files}
                  renderItem={(fileName) => (
                    <List.Item>
                      <Text>
                        <PaperClipOutlined style={{ marginRight: 8, color: isDark ? "#4da3ff" : "#0b5ed7" }} />
                        {fileName}
                      </Text>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </>
        )}
      </Content>
    </PageLayout>
  );
};

export default NoteDetailPage;
