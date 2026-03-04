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
import { createNote } from "../api/notes";

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

const CreateNotePage: React.FC = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState<string | undefined>(undefined);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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

    try {
      const storedUser = localStorage.getItem("user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;

      if (!currentUser || !currentUser.email) {
        message.error("Please log in first.");
        navigate("/login");
        return;
      }

      // Convert file to base64 if provided
      let fileData: any = null;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const base64 = await fileToBase64(fileList[0].originFileObj);
        fileData = {
          name: fileList[0].name,
          type: fileList[0].type || 'application/octet-stream',
          size: fileList[0].size || 0,
          data: base64
        };
      }

      // Call backend API to create note
      const response = await createNote(
        currentUser.email,
        title.trim(),
        description.trim(),
        module,
        fileData
      );
      
      if (!response.ok) {
        message.error(response.error || "Failed to create note.");
        return;
      }

      message.success("Note created successfully!");
      setTimeout(() => navigate("/my-notes"), 500);
    } catch (error) {
      console.error("Error creating note:", error);
      message.error("Failed to create note. Please try again.");
    }
  };

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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

            {/* File upload area */}
            <Card style={cardStyle}>
              <Text strong style={{ display: "block", marginBottom: 12 }}>Upload File (Optional)</Text>
              <Dragger
                maxCount={1}
                fileList={fileList}
                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                beforeUpload={(file) => {
                  const maxSize = 10 * 1024 * 1024; // 10MB limit
                  if (file.size > maxSize) {
                    message.error(`${file.name} is too large. Maximum file size is 10MB.`);
                    return false;
                  }
                  return false; // Prevent auto upload
                }}
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
                  Click or drag file to upload
                </p>
                <p style={{ fontSize: 13, color: "#999" }}>
                  Supports PDF, DOCX, images, and other file types (max 10MB)
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
