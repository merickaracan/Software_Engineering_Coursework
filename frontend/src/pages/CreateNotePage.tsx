import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Input,
  Button,
  Upload,
  Select,
  message,
  Row,
  Col,
} from "antd";
import {
  UploadOutlined,
  FileAddOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";
import { AVAILABLE_MODULES } from "../components/Modules";

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;
const { Dragger } = Upload;

const MODULE_OPTIONS = AVAILABLE_MODULES.map((m) => ({
  value: m.code,
  label: `${m.name} (${m.code})`,
}));

const CreateNotePage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState<string | undefined>(undefined);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
    border: isDark ? "1px solid #303030" : undefined,
    background: isDark ? "#1f1f1f" : "#fff",
    marginBottom: 24,
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      message.error("Please enter a note title.");
      return;
    }
    if (!module) {
      message.error("Please select a module.");
      return;
    }

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const email = currentUser?.email ?? "";

    setLoading(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          note_title: title.trim(),
          note_data: description.trim(),
          module,
          verified: 0,
          rating_average: 0,
          number_ratings: 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        message.error(data.error ?? "Failed to create note.");
        return;
      }

      const noteId = data.insertId ?? Date.now().toString();

      // Upload any attached files
      if (fileList.length > 0) {
        const formData = new FormData();
        fileList.forEach((f) => {
          if (f.originFileObj) formData.append("files", f.originFileObj);
        });
        await fetch(`/api/notes/${noteId}/files`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      }

      // Also save to localStorage so MyNotesPage stays in sync
      const localNote = {
        id: String(noteId),
        title: title.trim(),
        description: description.trim(),
        module,
        files: fileList.map((f) => f.name),
        createdAt: new Date().toISOString(),
        ownerEmail: email,
      };
      const stored = localStorage.getItem("myNotes");
      const notes = stored ? JSON.parse(stored) : [];
      notes.push(localNote);
      localStorage.setItem("myNotes", JSON.stringify(notes));

      message.success("Note created successfully!");
      setTimeout(() => navigate(`/modules/${module}`), 500);
    } catch {
      message.error("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <Row justify="center">
          <Col xs={24} md={20} lg={16}>
            <Row align="middle" style={{ marginBottom: 24 }}>
              <FileAddOutlined style={{ fontSize: 28, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 12 }} />
              <Title level={2} style={{ margin: 0 }}>Create Note</Title>
            </Row>

            {/* Note details */}
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
                    options={MODULE_OPTIONS}
                    showSearch
                    optionFilterProp="label"
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

            {/* File upload area */}
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

            {/* Actions */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  block
                  loading={loading}
                  onClick={handleSubmit}
                  style={{
                    backgroundColor: isDark ? "#4da3ff" : "#0b5ed7",
                    borderColor: isDark ? "#4da3ff" : "#0b5ed7",
                    borderRadius: 8,
                    height: 48,
                  }}
                >
                  Create Note
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button
                  size="large"
                  block
                  onClick={() => navigate("/my-notes")}
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

export default CreateNotePage;
