import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Tag,
  Button,
  Empty,
  Space,
  Popconfirm,
  message,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import PageLayout from "../Components/PageHeader";
import { useTheme } from "../Components/ThemeContext";
import { getNoteById, deleteNote } from "../api/notes";

const { Title, Text, Paragraph } = Typography;
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

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [note, setNote] = useState<Note | null | undefined>(undefined);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) {
        setNote(null);
        setLoading(false);
        return;
      }

      try {
        const response = await getNoteById(id);
        
        if (response.ok && response.data && response.data.length > 0) {
          const foundNote = response.data[0];
          setNote(foundNote);

          const storedUser = localStorage.getItem("user");
          const currentUser = storedUser ? JSON.parse(storedUser) : null;
          // Check if current user is the owner
          setIsOwner(currentUser?.email === foundNote.owner_email);
        } else {
          setNote(null);
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        setNote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleDelete = async () => {
    try {
      if (!id) return;
      
      const response = await deleteNote(id);
      
      if (!response.ok) {
        message.error(response.error || "Failed to delete note.");
        return;
      }
      
      message.success("Note deleted successfully.");
      setTimeout(() => navigate("/my-notes"), 500);
    } catch (error) {
      console.error("Error deleting note:", error);
      message.error("Failed to delete note. Please try again.");
    }
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

  if (loading) {
    return (
      <PageLayout>
        <Content style={{ padding: "32px" }}>
          <Spin size="large" tip="Loading note..." style={{ marginTop: 48 }} />
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
                  {new Date(note.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </div>
            </Card>

            {/* Content */}
            <Card title="Content" style={cardStyle}>
              {note.note_data ? (
                <Paragraph style={{ fontSize: 15, margin: 0, whiteSpace: "pre-wrap" }}>
                  {note.note_data}
                </Paragraph>
              ) : (
                <Text type="secondary">No content provided.</Text>
              )}
            </Card>
          </>
        )}
      </Content>
    </PageLayout>
  );
};

export default NoteDetailPage;
