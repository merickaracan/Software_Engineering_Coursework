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
  message,
  Row,
  Col,
  Result,
  Empty,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import PageLayout from "../Components/PageHeader";
import { useTheme } from "../Components/ThemeContext";

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
const { Dragger } = Upload;

const MODULES = [
  { value: "se", label: "Software Engineering" },
  { value: "ml", label: "Machine Learning" },
  { value: "sa", label: "Systems Architecture" },
  { value: "vc", label: "Visual Computing" },
  { value: "db", label: "Databases" },
  { value: "ai", label: "Artificial Intelligence" },
];

interface Note {
  id: string;
  title: string;
  description: string;
  module: string;
  files: string[];
  createdAt: string;
  ownerEmail: string;
}

const EditNotePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [note, setNote] = useState<Note | null | undefined>(undefined);
  const [isOwner, setIsOwner] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState<string | undefined>(undefined);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("myNotes");
    const notes: Note[] = stored ? JSON.parse(stored) : [];
    const found = notes.find((n) => n.id === id) ?? null;
    setNote(found);

    if (found) {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      // If ownerEmail is absent (note predates ownership feature), any logged-in user can edit
      const owns = !found.ownerEmail || currentUser?.email === found.ownerEmail;
      setIsOwner(owns);

      if (owns) {
        setTitle(found.title);
        setDescription(found.description);
        setModule(found.module);
        setFileList(
          found.files.map((name, i) => ({
            uid: String(i),
            name,
            status: "done" as const,
          }))
        );
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!title.trim()) {
      message.error("Please enter a note title.");
      return;
    }
    if (!module) {
      message.error("Please select a module.");
      return;
    }

    const stored = localStorage.getItem("myNotes");
    const notes: Note[] = stored ? JSON.parse(stored) : [];
    const updated = notes.map((n) =>
      n.id === id
        ? {
            ...n,
            title: title.trim(),
            description: description.trim(),
            module,
            files: fileList.map((f) => f.name),
          }
        : n
    );
    localStorage.setItem("myNotes", JSON.stringify(updated));
    message.success("Note updated successfully!");
    setTimeout(() => navigate(`/note/${id}`), 400);
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
    border: isDark ? "1px solid #303030" : undefined,
    background: isDark ? "#1f1f1f" : "#fff",
    marginBottom: 24,
  };

  // Loading state
  if (note === undefined) return null;

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
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/note/${id}`)}
                style={{ marginRight: 16, borderRadius: 8 }}
              >
                Cancel
              </Button>
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ borderRadius: 8 }}
                  />
                </div>
              </div>
            </Card>

            <Card style={cardStyle}>
              <Text strong style={{ display: "block", marginBottom: 12 }}>Upload Files</Text>
              <Dragger
                multiple
                fileList={fileList}
                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                beforeUpload={() => false}
                style={{
                  borderRadius: 12,
                  background: isDark ? "#141414" : "#fafafa",
                  border: isDark ? "1px dashed #303030" : undefined,
                }}
              >
                <p style={{ fontSize: 40, color: isDark ? "#4da3ff" : "#0b5ed7", marginBottom: 8 }}>
                  <InboxOutlined />
                </p>
                <p style={{ fontSize: 15, fontWeight: 500 }}>
                  Click or drag files to upload
                </p>
                <p style={{ fontSize: 13, color: "#999" }}>
                  Supports PDF, DOCX, images, and other file types
                </p>
              </Dragger>
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  block
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
              <Col xs={24} sm={12}>
                <Button
                  size="large"
                  block
                  onClick={() => navigate(`/note/${id}`)}
                  style={{ borderRadius: 8, height: 48 }}
                >
                  Cancel
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
