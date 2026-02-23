import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Form,
  Input,
  Button,
  Space,
  message,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useTheme } from "../Components/ThemeContext";

const { Title, Text } = Typography;
const { Content } = Layout;

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const onFinish = (values: LoginFormValues) => {
    setLoading(true);
    setTimeout(() => {
      // Look up user from registered users
      const stored = localStorage.getItem("registeredUsers");
      const registeredUsers: Record<string, { name: string; email: string }> =
        stored ? JSON.parse(stored) : {};

      const matched = registeredUsers[values.email];
      if (matched) {
        localStorage.setItem("user", JSON.stringify(matched));
      }

      console.log("Login form submitted:", values);
      message.success("Logged in successfully");
      setLoading(false);
      navigate("/dashboard");
    }, 700);
  };

  const onFinishFailed = () => {
    message.error("Please fix the errors in the form.");
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: isDark
          ? "linear-gradient(135deg, #0a1628 0%, #141414 60%)"
          : "linear-gradient(135deg, #0b5ed7 0%, #e9f2ff 60%)",
      }}
    >
      <Content>
        <div
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: 24,
            right: 32,
            cursor: "pointer",
            fontSize: 22,
            color: "#fff",
            zIndex: 10,
          }}
        >
          {isDark ? <SunOutlined /> : <MoonOutlined />}
        </div>
        <Row
          justify="center"
          align="middle"
          style={{ minHeight: "100vh", padding: "24px" }}
        >
          <Col xs={24} md={20} lg={16} xl={14}>
            <Row gutter={[32, 32]}>

              {/* Left panel – info / branding (hidden on very small screens) */}
              <Col xs={0} md={12}>
                <Card
                  bordered={false}
                  style={{
                    height: "100%",
                    minHeight: 500,
                    background:
                      "linear-gradient(145deg, #0b5ed7 0%, #1d74f5 40%, #3a8bff 100%)",
                    color: "#fff",
                  }}
                  bodyStyle={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    padding: "32px",
                  }}
                >
                  <Title level={2} style={{ color: "#fff", marginBottom: 16, textAlign: "center" }}>
                    Welcome to Notebuddy
                  </Title>
                  <Text style={{ color: "#dbe8ff", fontSize: 14, textAlign: "center" }}>
                    Log in to access your workspace, track your notes, and
                    continue where you left off.
                  </Text>

                  <Space
                    direction="vertical"
                    size="small"
                    style={{ marginTop: 24, fontSize: 13, color: "#e4edff" }}
                  >
                  </Space>
                </Card>
              </Col>

              {/* Right panel – login form */}
              <Col xs={24} md={12}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 16,
                    minHeight: 500,
                    boxShadow:
                      "0 18px 40px rgba(15, 35, 95, 0.18)",
                    backgroundColor: isDark ? "#1f1f1f" : "#ffffff",
                  }}
                  bodyStyle={{ padding: "32px 28px", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}
                >
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%", marginBottom: 24 }}
                  >
                    <Title
                      level={3}
                      style={{ margin: 0, color: isDark ? "#fff" : "#1f2933", textAlign: "center" }}
                    >
                      Login
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13, textAlign: "center" }}>
                      Enter your details to continue.
                    </Text>
                  </Space>

                  <Form<LoginFormValues>
                    layout="vertical"
                    name="loginForm"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                  >
                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Please enter your email." },
                        { type: "email", message: "Please enter a valid email." },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="ab1234@bath.ac.uk"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[
                        { required: true, message: "Please enter your password." },
                        { min: 6, message: "Password should be at least 6 characters." },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Enter your password"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 8 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<LoginOutlined />}
                        loading={loading}
                        block
                        style={{
                          backgroundColor: "#0b5ed7",
                          borderColor: "#0b5ed7",
                          borderRadius: 8,
                        }}
                      >
                        {loading ? "Logging in..." : "Login"}
                      </Button>
                    </Form.Item>
                  </Form>

                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      New here?{" "}
                      <a href="/register" style={{ color: "#0b5ed7", fontWeight: 500 }}>
                        Create an account
                      </a>
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Login;
