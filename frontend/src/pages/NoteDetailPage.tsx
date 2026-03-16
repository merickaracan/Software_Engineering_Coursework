import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  UserOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";

const { Title, Text, Paragraph } = Typography;
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

interface Comment {
  id: number;
  note_id: number;
  commenter_id: string;
  suggestion_data: string;
  note_owner_id: string;
}

interface NoteFile {
  id: number;
  note_id: number;
  filename: string;
  stored_name: string;
  uploaded_at: string;
}

const NoteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [noteFiles, setNoteFiles] = useState<NoteFile[]>([]);
  const [previewFile, setPreviewFile] = useState<NoteFile | null>(null);

  const getFileExtension = (filename: string) =>
    filename.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = (filename: string) => getFileExtension(filename) === "pdf";
  const isImage = (filename: string) =>
    ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(getFileExtension(filename));
  const isPptx = (filename: string) => getFileExtension(filename) === "pptx";

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const isOwner = note?.email === currentUser?.email;
  const isTeacher = currentUser?.role === "teacher";

  useEffect(() => {
    if (!id) return;
    const raterEmail = currentUser?.email ?? "";
    const requests: Promise<Response>[] = [
      fetch(`/api/notes/${id}`, { credentials: "include" }),
      fetch(`/api/suggestions/note/${id}`, { credentials: "include" }),
      fetch(`/api/notes/${id}/files`, { credentials: "include" }),
    ];
    if (raterEmail) {
      requests.push(fetch(`/api/notes/${id}/rating/${encodeURIComponent(raterEmail)}`, { credentials: "include" }));
    }
    Promise.all(requests.map((r) => r.then((res) => res.json())))
      .then(([noteData, commentsData, filesData, ratingData]) => {
        setNote(noteData?.data?.[0] ?? null);
        setComments(commentsData?.data ?? []);
        setNoteFiles(filesData?.data ?? []);
        if (ratingData?.rated) {
          setHasRated(true);
          setUserRating(Number(ratingData.rating));
        }
      })
      .catch(() => setNote(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVerify = async () => {
    if (!note) return;
    const endpoint = note.verified ? `/api/notes/unverify/${note.id}` : `/api/notes/verify/${note.id}`;
    try {
      const res = await fetch(endpoint, { method: "PUT", credentials: "include" });
      const data = await res.json();
      if (data.ok) {
        message.success(note.verified ? "Note unverified." : "Note verified.");
        setNote((prev) => prev ? { ...prev, verified: prev.verified ? 0 : 1 } : prev);
      } else {
        message.error(data.error || "Action failed.");
      }
    } catch {
      message.error("Network error.");
    }
  };

  const handleRate = async (value: number) => {
    if (!note || hasRated || isOwner) return;
    setUserRating(value);
    setHasRated(true);

    try {
      const res = await fetch(`/api/notes/${note.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rater_email: currentUser?.email, rating: value }),
      });
      const data = await res.json();
      if (res.ok) {
        setNote((prev) =>
          prev ? { ...prev, rating_average: data.newAverage, number_ratings: data.newCount } : prev
        );
        message.success("Rating submitted!");
      } else {
        message.error(data.error ?? "Failed to submit rating.");
        setHasRated(false);
      }
    } catch {
      message.error("Failed to submit rating.");
      setHasRated(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !note) return;
    setSubmittingComment(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          note_id: note.id,
          commenter_id: currentUser?.email ?? "Anonymous",
          suggestion_data: newComment.trim(),
          note_owner_id: note.email,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [
          ...prev,
          {
            id: data.insertId,
            note_id: note.id,
            commenter_id: currentUser?.email ?? "Anonymous",
            suggestion_data: newComment.trim(),
            note_owner_id: note.email,
          },
        ]);
        setNewComment("");
        message.success("Comment posted!");
      }
    } catch {
      message.error("Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
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
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ marginBottom: 24, borderRadius: 8 }}
          >
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
        {/* Actions */}
        <Space style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ borderRadius: 8 }}
          >
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
          {isTeacher && (
            <Button
              type={note.verified ? "default" : "primary"}
              danger={note.verified ? true : false}
              icon={note.verified ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              onClick={handleVerify}
              style={{ borderRadius: 8 }}
            >
              {note.verified ? "Unverify Note" : "Verify Note"}
            </Button>
          )}
        </Space>

        {/* Note header */}
        <Card style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <FileTextOutlined style={{ fontSize: 28, color: isDark ? "#4da3ff" : "#0b5ed7" }} />
            <Title level={2} style={{ margin: 0 }}>
              {note.note_title || "Untitled Note"}
            </Title>
          </div>
          <Space size="middle" wrap>
            <Tag color="blue" style={{ borderRadius: 6, fontSize: 13, padding: "2px 10px" }}>
              {note.module}
            </Tag>
            <Text type="secondary" style={{ fontSize: 13 }}>
              By {note.email}
            </Text>
            {note.verified ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Verified
              </Tag>
            ) : null}
          </Space>
        </Card>

        {/* Note content */}
        <Card title="Content" style={cardStyle}>
          {note.note_data ? (
            <Paragraph style={{ fontSize: 15, margin: 0, whiteSpace: "pre-wrap" }}>
              {note.note_data}
            </Paragraph>
          ) : (
            <Text type="secondary">No content provided.</Text>
          )}
        </Card>

        {/* Attachments */}
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
                    <Button
                      key="preview"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => setPreviewFile(file)}
                    >
                      Preview
                    </Button>,
                    <Button
                      key="download"
                      type="link"
                      icon={<DownloadOutlined />}
                      href={`/api/files/${file.id}`}
                      download={file.filename}
                    >
                      Download
                    </Button>,
                  ]}
                >
                  <Space>
                    <PaperClipOutlined style={{ color: isDark ? "#4da3ff" : "#0b5ed7" }} />
                    <Text>{file.filename}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* Rating */}
        <Card title="Rating" style={cardStyle}>
          <Space direction="vertical" size={4}>
            <Space align="center">
              <Rate
                allowHalf
                value={isOwner ? note.rating_average : userRating}
                onChange={isOwner || hasRated ? undefined : handleRate}
                disabled={isOwner || hasRated}
              />
              <Text type="secondary" style={{ fontSize: 13 }}>
                {note.number_ratings > 0
                  ? `${Number(note.rating_average).toFixed(1)} / 5 · ${note.number_ratings} ${note.number_ratings === 1 ? "rating" : "ratings"}`
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
                Thanks for rating!
              </Text>
            )}
          </Space>
        </Card>

        {/* Comments */}
        <Card title={`Comments (${comments.length})`} style={{ ...cardStyle, marginBottom: 0 }}>
          {comments.length > 0 && (
            <List
              dataSource={comments}
              style={{ marginBottom: 20 }}
              renderItem={(comment) => (
                <List.Item style={{ alignItems: "flex-start", padding: "12px 0" }}>
                  <Space direction="vertical" size={4} style={{ width: "100%" }}>
                    <Space>
                      <Avatar
                        size="small"
                        icon={<UserOutlined />}
                        style={{ backgroundColor: "#0b5ed7" }}
                      />
                      <Text strong style={{ fontSize: 13 }}>
                        {comment.commenter_id}
                      </Text>
                    </Space>
                    <Text style={{ fontSize: 14, paddingLeft: 28 }}>
                      {comment.suggestion_data}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
          )}
          {comments.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No comments yet. Be the first!"
              style={{ marginBottom: 20 }}
            />
          )}
          {/* Comment input */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <Input.TextArea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              style={{ borderRadius: 8, flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleComment}
              loading={submittingComment}
              disabled={!newComment.trim()}
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
      {/* File Preview Modal */}
      <Modal
        open={!!previewFile}
        title={previewFile?.filename}
        onCancel={() => setPreviewFile(null)}
        footer={
          <Button
            icon={<DownloadOutlined />}
            href={previewFile ? `/api/files/${previewFile.id}` : undefined}
            download={previewFile?.filename}
          >
            Download
          </Button>
        }
        width="80%"
        style={{ top: 20 }}
      >
        {previewFile && isPdf(previewFile.filename) && (
          <iframe
            src={`/api/files/${previewFile.id}/preview`}
            style={{ width: "100%", height: "75vh", border: "none" }}
            title={previewFile.filename}
          />
        )}
        {previewFile && isImage(previewFile.filename) && (
          <img
            src={`/api/files/${previewFile.id}/preview`}
            alt={previewFile.filename}
            style={{ maxWidth: "100%", display: "block", margin: "0 auto" }}
          />
        )}
        {previewFile && isPptx(previewFile.filename) && (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + "/api/files/" + previewFile.id + "/preview")}`}
            style={{ width: "100%", height: "75vh", border: "none" }}
            title={previewFile.filename}
          />
        )}
        {previewFile && !isPdf(previewFile.filename) && !isImage(previewFile.filename) && !isPptx(previewFile.filename) && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <PaperClipOutlined style={{ fontSize: 48, color: "#aaa", marginBottom: 16, display: "block" }} />
            <Text type="secondary">Preview not available for this file type.</Text>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
};

export default NoteDetailPage;
