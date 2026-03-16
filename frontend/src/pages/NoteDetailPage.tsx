import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Tag,
  Button,
  Space,
  Rate,
  Input,
  List,
  Avatar,
  Spin,
  Empty,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  UserOutlined,
  SendOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

interface RawNote {
  id: number | string;
  title?: string;
  note_title?: string;
  note_data?: string;
  module?: string;
  owner_email?: string;
  email?: string;
  owner_profile_picture?: string;
  is_verified?: number;
  verified?: number;
  rating_average?: number;
  number_ratings?: number;
  created_at?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  file_data?: string;
}

interface NoteView {
  id: number;
  title: string;
  content: string;
  module: string;
  ownerEmail: string;
  ownerProfilePicture?: string;
  verified: number;
  ratingAverage: number;
  numberRatings: number;
  createdAt?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileData?: string;
}

interface CommentItem {
  id: number;
  note_id: number;
  commenter_id: number | string;
  suggestion_data: string;
  created_at?: string;
  commenter_name?: string;
  commenter_email?: string;
  commenter_profile_picture?: string;
  lecturer?: number | boolean;
}

interface NoteFile {
  id: number;
  note_id: number;
  filename: string;
  stored_name: string;
  file_type?: string;
  file_size?: number;
  uploaded_at: string;
}

interface UserSession {
  id?: number;
  email?: string;
  role?: string;
  lecturer?: number | string;
}

const MODULE_LABELS: Record<string, string> = {
  se: "Software Engineering",
  ml: "Machine Learning",
  sa: "Systems Architecture",
  vc: "Visual Computing",
  db: "Databases",
  ai: "Artificial Intelligence",
};

const normalizeNote = (raw: RawNote): NoteView => ({
  id: Number(raw.id),
  title: raw.title ?? raw.note_title ?? "Untitled Note",
  content: raw.note_data ?? "",
  module: raw.module ?? "",
  ownerEmail: raw.owner_email ?? raw.email ?? "",
  ownerProfilePicture: raw.owner_profile_picture,
  verified: Number(raw.is_verified ?? raw.verified ?? 0),
  ratingAverage: Number(raw.rating_average ?? 0),
  numberRatings: Number(raw.number_ratings ?? 0),
  createdAt: raw.created_at,
  fileName: raw.file_name,
  fileType: raw.file_type,
  fileSize: raw.file_size,
  fileData: raw.file_data,
});

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return "0 Bytes";
  const units = ["Bytes", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${Math.round((bytes / Math.pow(1024, index)) * 100) / 100} ${units[index]}`;
};

const isPdfFile = (fileType?: string, fileName?: string): boolean => {
  const normalizedType = (fileType || "").toLowerCase();
  const normalizedName = (fileName || "").toLowerCase();
  return normalizedType.includes("application/pdf") || normalizedName.endsWith(".pdf");
};

const toDataUrlIfNeeded = (rawData?: string, mimeType = "application/pdf"): string | null => {
  if (!rawData) return null;
  const trimmed = rawData.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return trimmed;
  return `data:${mimeType};base64,${trimmed}`;
};

const toImageSrcIfNeeded = (rawImage?: string): string | undefined => {
  if (!rawImage) return undefined;
  const trimmed = rawImage.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("data:") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `data:image/jpeg;base64,${trimmed}`;
};

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const currentUser: UserSession = useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : {};
  }, []);

  const hasLecturerHint =
    currentUser.email === "admin" ||
    currentUser.role === "teacher" ||
    Number(currentUser.lecturer ?? 0) === 1;

  const [note, setNote] = useState<NoteView | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [noteFiles, setNoteFiles] = useState<NoteFile[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLecturer, setIsLecturer] = useState(hasLecturerHint);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [selectedPdfPreview, setSelectedPdfPreview] = useState<{ url: string; name: string } | null>(null);

  const isOwner = Boolean(note && currentUser.email && note.ownerEmail === currentUser.email);

  const inlinePdfPreviewUrl = useMemo(() => {
    if (!note || !note.fileData || !isPdfFile(note.fileType, note.fileName)) return null;
    return toDataUrlIfNeeded(note.fileData, note.fileType || "application/pdf");
  }, [note]);

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      if (!currentUser.email) {
        setIsLecturer(false);
        return;
      }

      if (hasLecturerHint) {
        setIsLecturer(true);
      }

      try {
        const response = await fetch(`/api/users/${encodeURIComponent(currentUser.email)}`, {
          credentials: "include",
        });
        const data = await response.json();
        const userData = data?.ok && Array.isArray(data.data) ? data.data[0] : null;
        const isAdminTeacher = currentUser.email === "admin";
        const isLecturerAccount = Number(userData?.lecturer ?? 0) === 1;
        setIsLecturer(isAdminTeacher || isLecturerAccount);
      } catch {
        // Keep current value so role-fetch failures don't hide lecturer controls.
        setIsLecturer((prev) => prev);
      }
    };

    fetchCurrentUserRole();
  }, [currentUser.email, hasLecturerHint]);

  useEffect(() => {
    const fetchAll = async () => {
      if (!id) {
        setNote(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const noteResponse = await fetch(`/api/notes/${id}`, { credentials: "include" });
        const noteData = await noteResponse.json();
        const noteRow: RawNote | undefined = noteData?.data?.[0];

        if (!noteData?.ok || !noteRow) {
          setNote(null);
          return;
        }

        const normalized = normalizeNote(noteRow);
        setNote(normalized);

        const [commentsRes, filesRes] = await Promise.all([
          fetch(`/api/suggestions/note/${id}`, { credentials: "include" }),
          fetch(`/api/notes/${id}/files`, { credentials: "include" }),
        ]);

        const commentsData = await commentsRes.json().catch(() => ({ ok: false, data: [] }));
        const filesData = await filesRes.json().catch(() => ({ ok: false, data: [] }));

        setComments(Array.isArray(commentsData?.data) ? commentsData.data : []);
        setNoteFiles(Array.isArray(filesData?.data) ? filesData.data : []);

        const firstPdfAttachment = (Array.isArray(filesData?.data) ? filesData.data : []).find((file: NoteFile) =>
          isPdfFile(file.file_type, file.filename)
        );

        if (firstPdfAttachment) {
          setSelectedPdfPreview({
            url: `/api/files/${firstPdfAttachment.id}/view`,
            name: firstPdfAttachment.filename,
          });
        } else {
          setSelectedPdfPreview(null);
        }

        if (currentUser.email) {
          const ratingRes = await fetch(
            `/api/notes/${id}/rating/${encodeURIComponent(currentUser.email)}`,
            { credentials: "include" }
          );
          const ratingData = await ratingRes.json().catch(() => ({ rated: false }));

          if (ratingData?.rated) {
            setHasRated(true);
            setUserRating(Number(ratingData.rating));
          } else {
            setHasRated(false);
            setUserRating(0);
          }
        }
      } catch (error) {
        console.error("Error loading note detail:", error);
        setNote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id, currentUser.email]);

  const refreshComments = async () => {
    if (!id) return;

    try {
      setCommentsLoading(true);
      const response = await fetch(`/api/suggestions/note/${id}`, { credentials: "include" });
      const data = await response.json();
      setComments(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePreviewAttachmentPdf = (file: NoteFile) => {
    setSelectedPdfPreview({
      url: `/api/files/${file.id}/view`,
      name: file.filename,
    });
  };

  const handleVerifyToggle = async () => {
    if (!note || !id) return;

    const endpoint = note.verified === 1 ? `/api/notes/unverify/${id}` : `/api/notes/verify/${id}`;

    try {
      setVerificationLoading(true);
      const response = await fetch(endpoint, { method: "PUT", credentials: "include" });
      const data = await response.json();

      if (!data?.ok) {
        message.error(data?.error || data?.message || "Failed to update verification status");
        return;
      }

      setNote((prev) => (prev ? { ...prev, verified: prev.verified === 1 ? 0 : 1 } : prev));
      message.success(note.verified === 1 ? "Note marked as unverified" : "Note marked as teacher verified");
    } catch {
      message.error("Failed to update verification status");
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleRate = async (value: number) => {
    if (!note || !id || isOwner || hasRated) return;

    try {
      const response = await fetch(`/api/notes/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rater_email: currentUser.email, rating: value }),
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        message.error(data?.error || "Failed to submit rating");
        return;
      }

      setUserRating(value);
      setHasRated(true);
      setNote((prev) =>
        prev
          ? {
              ...prev,
              ratingAverage: Number(data.newAverage ?? prev.ratingAverage),
              numberRatings: Number(data.newCount ?? prev.numberRatings),
            }
          : prev
      );
      message.success("Rating submitted");
    } catch {
      message.error("Failed to submit rating");
    }
  };

  const handleAddComment = async () => {
    if (!id || !note || !commentText.trim()) {
      message.warning("Please enter a comment");
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          note_id: Number(id),
          commenter_id: currentUser.id ?? currentUser.email ?? "anonymous",
          suggestion_data: commentText.trim(),
          note_owner_id: note.ownerEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        message.error(data?.error || data?.message || "Failed to add comment");
        return;
      }

      setCommentText("");
      await refreshComments();
      message.success("Comment added");
    } catch {
      message.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDownloadInlineFile = () => {
    if (!note?.fileData || !note.fileName) {
      message.error("File data not available");
      return;
    }

    const link = document.createElement("a");
    link.href = note.fileData;
    link.download = note.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
    border: isDark ? "1px solid #303030" : undefined,
    background: isDark ? "#1f1f1f" : "#fff",
    marginBottom: 24,
  };

  if (loading) {
    return (
      <PageLayout>
        <Content style={{ padding: "32px", textAlign: "center" }}>
          <Spin size="large" />
        </Content>
      </PageLayout>
    );
  }

  if (!note) {
    return (
      <PageLayout>
        <Content style={{ padding: "32px" }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 24, borderRadius: 8 }}>
            Back
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ borderRadius: 8 }}>
            Back
          </Button>

          {isOwner && (
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
          )}

          {isLecturer && (
            <Button
              icon={<SafetyCertificateOutlined />}
              loading={verificationLoading}
              type={note.verified === 1 ? "default" : "primary"}
              onClick={handleVerifyToggle}
              style={{ borderRadius: 8 }}
            >
              {note.verified === 1 ? "Teacher Unverify" : "Teacher Verify"}
            </Button>
          )}
        </Space>

        <Card style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <FileTextOutlined style={{ fontSize: 28, color: isDark ? "#4da3ff" : "#0b5ed7" }} />
            <Title level={2} style={{ margin: 0 }}>
              {note.title}
            </Title>
          </div>

          <Space size="middle" wrap>
            <Tag color="blue" style={{ borderRadius: 6, fontSize: 13, padding: "2px 10px" }}>
              {MODULE_LABELS[note.module] ?? note.module}
            </Tag>
            {note.ownerEmail && (
              <Space size={8} align="center">
                <Avatar
                  size="small"
                  src={toImageSrcIfNeeded(note.ownerProfilePicture)}
                  icon={<UserOutlined />}
                />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  By {note.ownerEmail}
                </Text>
              </Space>
            )}
            {note.createdAt && (
              <Text type="secondary" style={{ fontSize: 13 }}>
                {new Date(note.createdAt).toLocaleDateString()}
              </Text>
            )}
            {note.verified === 1 && (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Teacher Verified
              </Tag>
            )}
          </Space>
        </Card>

        <Card title="Content" style={cardStyle}>
          {note.content ? (
            <Paragraph style={{ fontSize: 15, margin: 0, whiteSpace: "pre-wrap" }}>{note.content}</Paragraph>
          ) : (
            <Text type="secondary">No content provided.</Text>
          )}
        </Card>

        {note.fileName && (
          <Card
            title={
              <Space>
                <PaperClipOutlined />
                Attached File
              </Space>
            }
            style={cardStyle}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Space orientation="vertical" size={0}>
                <Text strong>{note.fileName}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {note.fileSize ? formatFileSize(note.fileSize) : "Unknown size"}
                  {note.fileType ? ` • ${note.fileType}` : ""}
                </Text>
              </Space>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadInlineFile}>
                Download
              </Button>
            </div>

            {inlinePdfPreviewUrl && (
              <div style={{ marginTop: 16, border: `1px solid ${isDark ? "#434343" : "#d9d9d9"}`, borderRadius: 6, overflow: "hidden" }}>
                <iframe src={inlinePdfPreviewUrl} style={{ width: "100%", minHeight: "70vh", border: "none" }} title={note.fileName} />
              </div>
            )}
          </Card>
        )}

        {noteFiles.length > 0 && (
          <Card
            title={
              <Space>
                <PaperClipOutlined />
                {`Attachments (${noteFiles.length})`}
              </Space>
            }
            style={cardStyle}
          >
            <List
              dataSource={noteFiles}
              renderItem={(file) => (
                <List.Item
                  actions={[
                    isPdfFile(file.file_type, file.filename) ? (
                      <Button key="preview" type="link" icon={<EyeOutlined />} onClick={() => handlePreviewAttachmentPdf(file)}>
                        Preview
                      </Button>
                    ) : null,
                    <Button key="download" type="link" icon={<DownloadOutlined />} href={`/api/files/${file.id}`} download={file.filename}>
                      Download
                    </Button>,
                  ].filter(Boolean)}
                >
                  <Text>{file.filename}</Text>
                </List.Item>
              )}
            />
          </Card>
        )}

        {selectedPdfPreview && (
          <Card
            title={
              <Space>
                <PaperClipOutlined />
                PDF Preview: {selectedPdfPreview.name}
              </Space>
            }
            style={cardStyle}
          >
            <div
              style={{
                border: `1px solid ${isDark ? "#434343" : "#d9d9d9"}`,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <iframe
                src={selectedPdfPreview.url}
                style={{ width: "100%", minHeight: "75vh", border: "none" }}
                title={`Preview ${selectedPdfPreview.name}`}
              />
            </div>
          </Card>
        )}

        <Card title="Rating" style={cardStyle}>
          <Space orientation="vertical" size={4}>
            <Space align="center">
              <Rate
                allowHalf
                value={isOwner ? note.ratingAverage : userRating}
                onChange={isOwner || hasRated ? undefined : handleRate}
                disabled={isOwner || hasRated}
              />
              <Text type="secondary" style={{ fontSize: 13 }}>
                {note.numberRatings > 0
                  ? `${note.ratingAverage.toFixed(1)} / 5 • ${note.numberRatings} ${note.numberRatings === 1 ? "rating" : "ratings"}`
                  : "No ratings yet"}
              </Text>
            </Space>
            {!isOwner && !hasRated && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Click the stars to rate this note
              </Text>
            )}
            {hasRated && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Thanks for rating
              </Text>
            )}
          </Space>
        </Card>

        <Card title={`Comments (${comments.length})`} style={{ ...cardStyle, marginBottom: 0 }} loading={commentsLoading}>
          {comments.length > 0 ? (
            <List
              dataSource={comments}
              style={{ marginBottom: 20 }}
              renderItem={(comment) => {
                const author = comment.commenter_name || comment.commenter_email || String(comment.commenter_id);
                return (
                  <List.Item style={{ alignItems: "flex-start", padding: "12px 0" }}>
                    <Space orientation="vertical" size={4} style={{ width: "100%" }}>
                      <Space>
                        <Avatar
                          size="small"
                          src={toImageSrcIfNeeded(comment.commenter_profile_picture)}
                          icon={<UserOutlined />}
                          style={{ backgroundColor: "#0b5ed7" }}
                        />
                        <Text strong style={{ fontSize: 13 }}>
                          {author}
                        </Text>
                        {Boolean(comment.lecturer) && <CheckCircleOutlined style={{ color: "#52c41a" }} />}
                      </Space>
                      <Text style={{ fontSize: 14, paddingLeft: 28 }}>{comment.suggestion_data}</Text>
                    </Space>
                  </List.Item>
                );
              }}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No comments yet. Be the first!" style={{ marginBottom: 20 }} />
          )}

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <Input.TextArea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={2}
              style={{ borderRadius: 8, flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleAddComment}
              loading={submittingComment}
              disabled={!commentText.trim()}
              style={{
                backgroundColor: isDark ? "#4da3ff" : "#0b5ed7",
                borderColor: isDark ? "#4da3ff" : "#0b5ed7",
                borderRadius: 8,
              }}
            >
              Post
            </Button>
          </div>
        </Card>
      </Content>
    </PageLayout>
  );
};

export default NoteDetailPage;
