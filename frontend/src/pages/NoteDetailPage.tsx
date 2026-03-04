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
  Input,
  List,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CalendarOutlined,
  PaperClipOutlined,
  DownloadOutlined,
  UserOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";
import { getNoteById, deleteNote, verifyNote, unverifyNote } from "../api/notes";
import { getSuggestionsByNoteId, createSuggestion } from "../api/suggestions";
import { getUser } from "../api/users";

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
  file_name?: string;
  file_type?: string;
  file_size?: number;
  file_data?: string;
}

interface Comment {
  id: number;
  note_id: number;
  commenter_id: number;
  suggestion_data: string;
  created_at: string;
  commenter_name?: string;
  commenter_email?: string;
  commenter_profile_picture?: string;
  is_lecturer?: boolean;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLecturer, setIsLecturer] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

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

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      if (!currentUser?.email) {
        setIsLecturer(false);
        return;
      }

      try {
        const response = await getUser(currentUser.email);
        const userData = response?.ok && Array.isArray(response.data) ? response.data[0] : null;
        setIsLecturer(userData?.is_lecturer === 1);
      } catch (error) {
        console.error("Error fetching user role:", error);
        setIsLecturer(false);
      }
    };

    fetchCurrentUserRole();
  }, []);

  // Fetch comments for this note
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      
      try {
        setCommentsLoading(true);
        const response = await getSuggestionsByNoteId(Number(id));
        
        if (response.ok && response.data) {
          setComments(response.data);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchComments();
  }, [id]);

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      message.warning("Please enter a comment");
      return;
    }

    try {
      setSubmittingComment(true);
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      if (!currentUser?.id || !id) {
        message.error("Unable to post comment");
        return;
      }

      const response = await createSuggestion(
        currentUser.id,
        commentText,
        Number(id)
      );

      if (response.ok) {
        message.success("Comment added successfully");
        setCommentText("");
        // Refresh comments
        const commentsResponse = await getSuggestionsByNoteId(Number(id));
        if (commentsResponse.ok && commentsResponse.data) {
          setComments(commentsResponse.data);
        }
      } else {
        message.error(response.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      message.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

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

  const handleToggleVerification = async () => {
    if (!id || !note) return;

    try {
      setVerificationLoading(true);
      const response = note.is_verified === 1 ? await unverifyNote(id) : await verifyNote(id);

      if (!response.ok) {
        message.error(response.error || "Failed to update verification status");
        return;
      }

      setNote({ ...note, is_verified: note.is_verified === 1 ? 0 : 1 });
      message.success(note.is_verified === 1 ? "Note marked as unverified" : "Note marked as teacher verified");
    } catch (error) {
      console.error("Error toggling note verification:", error);
      message.error("Failed to update verification status");
    } finally {
      setVerificationLoading(false);
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
          {isLecturer && note && (
            <Popconfirm
              title={note.is_verified === 1 ? "Mark as unverified?" : "Mark as teacher verified?"}
              description={note.is_verified === 1 ? "This will remove the teacher verified status." : "This will add teacher verified status to this note."}
              okText="Confirm"
              cancelText="Cancel"
              onConfirm={handleToggleVerification}
            >
              <Button
                icon={<SafetyCertificateOutlined />}
                loading={verificationLoading}
                type={note.is_verified === 1 ? "default" : "primary"}
                style={{
                  borderRadius: 8,
                  backgroundColor: note.is_verified === 1 ? undefined : (isDark ? "#4da3ff" : "#0b5ed7"),
                  borderColor: note.is_verified === 1 ? undefined : (isDark ? "#4da3ff" : "#0b5ed7"),
                }}
              >
                {note.is_verified === 1 ? "Teacher Unverify" : "Teacher Verify"}
              </Button>
            </Popconfirm>
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

            {/* Attached File */}
            {note.file_name && (
              <Card
                title={
                  <span>
                    <PaperClipOutlined style={{ marginRight: 8 }} />
                    Attached File
                  </span>
                }
                style={cardStyle}
              >
                {/* File metadata section */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <PaperClipOutlined 
                      style={{ 
                        fontSize: 24, 
                        color: isDark ? "#4da3ff" : "#0b5ed7" 
                      }} 
                    />
                    <div>
                      <Text strong style={{ display: "block" }}>
                        {note.file_name}
                      </Text>
                      <Space style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {note.file_size ? formatFileSize(note.file_size) : "Unknown size"}
                        </Text>
                        {note.file_type && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {note.file_type}
                          </Text>
                        )}
                      </Space>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => note.file_data && handleDownloadFile(note)}
                    style={{
                      backgroundColor: isDark ? "#4da3ff" : "#0b5ed7",
                      borderColor: isDark ? "#4da3ff" : "#0b5ed7",
                    }}
                  >
                    Download
                  </Button>
                </div>

                {/* PDF viewer section */}
                {note.file_type === "application/pdf" && note.file_data && (
                  <div style={{
                    marginTop: 16,
                    border: `1px solid ${isDark ? "#434343" : "#d9d9d9"}`,
                    borderRadius: 6,
                    overflow: "auto",
                    minHeight: "100vh"
                  }}>
                    <iframe
                      src={note.file_data}
                      style={{
                        width: "100%",
                        height: "100%",
                        minHeight: "100vh",
                        border: "none"
                      }}
                      title={note.file_name}
                    />
                  </div>
                )}
              </Card>
            )}

            {/* Comments Section */}
            <Card title="Comments" style={cardStyle} loading={commentsLoading}>
              {/* Comment Form */}
              <Space direction="vertical" style={{ width: "100%", marginBottom: 24 }}>
                <Input.TextArea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  style={{
                    backgroundColor: isDark ? "#262626" : "#fafafa",
                    borderColor: isDark ? "#434343" : "#d9d9d9",
                    color: isDark ? "#fff" : "#000"
                  }}
                />
                <Button
                  type="primary"
                  onClick={handleAddComment}
                  loading={submittingComment}
                  style={{
                    backgroundColor: isDark ? "#4da3ff" : "#0b5ed7",
                    borderColor: isDark ? "#4da3ff" : "#0b5ed7",
                  }}
                >
                  Post Comment
                </Button>
              </Space>

              {/* Comments List */}
              {comments.length > 0 ? (
                <List
                  dataSource={comments}
                  renderItem={(comment) => (
                    <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={comment.commenter_profile_picture || undefined}
                            icon={<UserOutlined />}
                            style={{
                              backgroundColor: isDark ? "#4da3ff" : "#0b5ed7",
                            }}
                          />
                        }
                        title={
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span>{comment.commenter_name || comment.commenter_email || "Unknown"}</span>
                            {comment.is_lecturer && (
                              <CheckCircleOutlined
                                style={{
                                  color: "#52c41a",
                                  fontSize: 16,
                                }}
                                title="Lecturer"
                              />
                            )}
                          </div>
                        }
                        description={
                          <div>
                            <Text style={{ fontSize: 12, color: isDark ? "#8c8c8c" : "#999" }}>
                              {new Date(comment.created_at).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                            <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                              {comment.suggestion_data}
                            </Paragraph>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No comments yet. Be the first to comment!" />
              )}
            </Card>
          </>
        )}
      </Content>
    </PageLayout>
  );
};

const handleDownloadFile = (note: Note) => {
  try {
    if (!note.file_data || !note.file_name) {
      message.error("File data not available");
      return;
    }
    // Convert base64 to blob and download
    const link = document.createElement('a');
    link.href = note.file_data;
    link.download = note.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(`Downloaded ${note.file_name}`);
  } catch (error) {
    console.error("Error downloading file:", error);
    message.error("Failed to download file");
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default NoteDetailPage;
