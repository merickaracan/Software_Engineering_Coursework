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
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";
import { getNoteById, updateNote } from "../api/notes";

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
  note_data: string;
  module: string;
  owner_email: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  file_data?: string;
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
    const fetchNote = async () => {
      if (!id) {
        setNote(null);
        return;
      }

      try {
        const response = await getNoteById(id);
        const found = response?.ok && Array.isArray(response.data) && response.data.length > 0
          ? response.data[0]
          : null;

        setNote(found);

        if (!found) {
          return;
        }

        const storedUser = localStorage.getItem("user");
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const owns = currentUser?.email === found.owner_email;
        setIsOwner(owns);

        if (owns) {
          setTitle(found.title || "");
          setDescription(found.note_data || "");
          setModule(found.module);

          if (found.file_name) {
            setFileList([
              {
                uid: "existing-file",
                name: found.file_name,
                status: "done",
              },
            ]);
          } else {
            setFileList([]);
          }
        }
      } catch (error) {
        console.error("Error fetching note for editing:", error);
        setNote(null);
      }
    };

    fetchNote();
  }, [id]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
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

    if (!id || !note) {
      message.error("Note not found.");
      return;
    }

    try {
      let filePayload = null;

      if (fileList.length > 0) {
        const selectedFile = fileList[0];

        if (selectedFile.originFileObj) {
          const base64 = await fileToBase64(selectedFile.originFileObj);
          filePayload = {
            name: selectedFile.name,
            type: selectedFile.type || "application/octet-stream",
            size: selectedFile.size || 0,
            data: base64,
          };
        } else if (note.file_name && note.file_data) {
          filePayload = {
            name: note.file_name,
            type: note.file_type || "application/octet-stream",
            size: note.file_size || 0,
            data: note.file_data,
          };
        }
      }

      const response = await updateNote(id, title.trim(), description.trim(), module, filePayload);

      if (!response.ok) {
        message.error(response.error || "Failed to update note.");
        return;
      }

      message.success("Note updated successfully!");
      setTimeout(() => navigate(`/note/${id}`), 400);
    } catch (error) {
      console.error("Error updating note:", error);
      message.error("Failed to update note. Please try again.");
    }
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
                maxCount={1}
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
