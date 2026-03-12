import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Input,
  Button,
  Select,
  Upload,
  List,
  Space,
  message,
  Modal,
  Row,
  Col,
  Result,
  Empty,
  Spin,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";

const { Dragger } = Upload;

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

const MODULES = [
  { value: "se", label: "Software Engineering" },
  { value: "ml", label: "Machine Learning" },
  { value: "sa", label: "Systems Architecture" },
  { value: "vc", label: "Visual Computing" },
  { value: "db", label: "Databases" },
  { value: "ai", label: "Artificial Intelligence" },
];

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

interface NoteFile {
  id: number;
  note_id: number;
  filename: string;
  stored_name: string;
  uploaded_at: string;
}

const EditNotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [note, setNote] = useState<Note | null | undefined>(undefined);
  const [isOwner, setIsOwner] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [noteData, setNoteData] = useState("");
  const [module, setModule] = useState<string | undefined>(undefined);
  const [existingFiles, setExistingFiles] = useState<NoteFile[]>([]);
  const [newFiles, setNewFiles] = useState<UploadFile[]>([]);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/notes/${id}`, { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/notes/${id}/files`, { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([noteRes, filesRes]) => {
        const found: Note | null = noteRes?.data?.[0] ?? null;
        setNote(found);
        setExistingFiles(filesRes?.data ?? []);
        if (found) {
          const storedUser = localStorage.getItem("user");
          const currentUser = storedUser ? JSON.parse(storedUser) : null;
          const owns = currentUser?.email === found.email;
          setIsOwner(owns);
          if (owns) {
            setTitle(found.note_title ?? "");
            setNoteData(found.note_data ?? "");
            setModule(found.module);
          }
        }
      })
      .catch(() => setNote(null));
  }, [id]);

  const handleDeleteFile = (fileId: number) => {
    Modal.confirm({
      title: "Remove this attachment?",
      content: "The file will be permanently deleted.",
      okText: "Remove",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        setDeletingFileId(fileId);
        try {
          const res = await fetch(`/api/files/${fileId}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (res.ok) {
            setExistingFiles((prev) => prev.filter((f) => f.id !== fileId));
            message.success("Attachment removed.");
          } else {
            message.error("Failed to remove attachment.");
          }
        } catch {
          message.error("Failed to remove attachment.");
        } finally {
          setDeletingFileId(null);
        }
      },
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      message.error("Please enter a note title.");
      return;
    }
    if (!module) {
      message.error("Please select a module.");
      return;
    }
    if (!note) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: note.email,
          verified: note.verified,
          note_data: noteData.trim(),
          rating_average: note.rating_average,
          number_ratings: note.number_ratings,
          module,
          note_title: title.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        message.error(data.error ?? "Failed to update note.");
        return;
      }

      // Upload any newly added files
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((f) => {
          if (f.originFileObj) formData.append("files", f.originFileObj);
        });
        await fetch(`/api/notes/${id}/files`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      }

      message.success("Note updated successfully!");
      setTimeout(() => navigate(`/note/${id}`, { replace: true }), 400);
    } catch {
      message.error("Failed to update note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete this note?",
      content: "This action cannot be undone. The note will be permanently removed.",
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await fetch(`/api/notes/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (res.ok) {
            message.success("Note deleted.");
            navigate("/my-notes");
          } else {
            message.error("Failed to delete note.");
          }
        } catch {
          message.error("Failed to delete note.");
        }
      },
    });
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
    border: isDark ? "1px solid #303030" : undefined,
    background: isDark ? "#1f1f1f" : "#fff",
    marginBottom: 24,
  };

  // Loading state
  if (note === undefined) {
    return (
      <PageLayout>
        <Content style={{ padding: "32px", textAlign: "center" }}>
          <Spin size="large" />
        </Content>
      </PageLayout>
    );
  }

  // Note not found
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

  // Not the owner
  if (!isOwner) {
    return (
      <PageLayout>
        <Content style={{ padding: "32px" }}>
          <Result
            status="403"
            title="Access Denied"
            subTitle="You don't have permission to edit this note."
            extra={
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/note/${id}`)}
                style={{ backgroundColor: isDark ? "#4da3ff" : "#0b5ed7", borderRadius: 8 }}
              >
                Back to Note
              </Button>
            }
          />
        </Content>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <Row justify="center">
          <Col xs={24} md={20} lg={16}>
            <Row align="middle" style={{ marginBottom: 24 }}>
              <Title level={2} style={{ margin: 0 }}>Edit Note</Title>
            </Row>

            <Card style={cardStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>Title</Text>
                  <Input
                    placeholder="Enter note title..."
                    size="large"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ borderRadius: 8 }}
                  />
                </div>

                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>Module</Text>
                  <Select
                    placeholder="Select a module"
                    size="large"
                    value={module}
                    onChange={setModule}
                    options={MODULES}
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </div>

                <div>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>Description</Text>
                  <TextArea
                    placeholder="Add a description or summary of your note..."
                    rows={4}
                    value={noteData}
                    onChange={(e) => setNoteData(e.target.value)}
                    style={{ borderRadius: 8 }}
                  />
                </div>
              </div>
            </Card>

            <Card style={cardStyle}>
              <Text strong style={{ display: "block", marginBottom: 12 }}>Attachments</Text>

              {existingFiles.length > 0 && (
                <List
                  dataSource={existingFiles}
                  style={{ marginBottom: 16 }}
                  renderItem={(file) => (
                    <List.Item
                      actions={[
                        <Button
                          key="delete"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          loading={deletingFileId === file.id}
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          Remove
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
              )}

              <Dragger
                multiple
                fileList={newFiles}
                onChange={({ fileList }) => setNewFiles(fileList)}
                beforeUpload={() => false}
                style={{
                  borderRadius: 12,
                  background: isDark ? "#141414" : "#fafafa",
                  border: isDark ? "1px dashed #303030" : undefined,
                }}
              >
                <p style={{ fontSize: 32, color: isDark ? "#4da3ff" : "#0b5ed7", marginBottom: 8 }}>
                  <InboxOutlined />
                </p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>Click or drag files to add attachments</p>
                <p style={{ fontSize: 12, color: "#999" }}>
                  New files will be uploaded when you save
                </p>
              </Dragger>
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  block
                  loading={saving}
                  onClick={handleSave}
                  style={{
                    backgroundColor: isDark ? "#4da3ff" : "#0b5ed7",
                    borderColor: isDark ? "#4da3ff" : "#0b5ed7",
                    borderRadius: 8,
                    height: 48,
                  }}
                >
                  Save Changes
                </Button>
              </Col>
              <Col xs={24} sm={8}>
                <Button
                  size="large"
                  block
                  onClick={() => navigate(-1)}
                  style={{ borderRadius: 8, height: 48 }}
                >
                  Cancel
                </Button>
              </Col>
              <Col xs={24} sm={8}>
                <Button
                  danger
                  size="large"
                  icon={<DeleteOutlined />}
                  block
                  onClick={handleDelete}
                  style={{ borderRadius: 8, height: 48 }}
                >
                  Delete Note
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
    </PageLayout>
  );
};

export default EditNotePage;
