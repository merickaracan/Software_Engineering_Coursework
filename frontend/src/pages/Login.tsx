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
import type { Rule } from "antd/es/form";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Content } = Layout;

const LoginRules: Record<string, Rule[]> = {
  email: [
      { required: true, message: "Please enter your email." },
      { type: "email", message: "Please enter a valid email address (e.g., user@bath.ac.uk)." },
      { pattern: /^[a-zA-Z0-9]+@bath\.ac\.uk$/, message: ""},
  ],
  
  password: [
    { required: true, message: "Please enter your password." },

  ],
  
};

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    const request = await fetch("/api/login", {
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify(values)
    })

    const data = await request.json();

    if (!data.ok) {
      message.error(data.message || "Login failed. Please try again.");
      setLoading(false);
      return;
    }

    message.success("Logged in successfully");
    setLoading(false);
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify({ email: values.email }));
    navigate("/dashboard");


  };

  const onFinishFailed = () => {
    message.error("Please fix the errors in the form.");
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b5ed7 0%, #e9f2ff 60%)",
      }}
    >
      <Content>
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
                    background:
                      "linear-gradient(145deg, #0b5ed7 0%, #1d74f5 40%, #3a8bff 100%)",
                    color: "#fff",
                  }}
                  bodyStyle={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                    padding: "32px",
                  }}
                >
                  <Title level={2} style={{ color: "#fff", marginBottom: 16 }}>
                    Welcome to Notebuddy 
                  </Title>
                  <Text style={{ color: "#dbe8ff", fontSize: 14 }}>
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
                    boxShadow:
                      "0 18px 40px rgba(15, 35, 95, 0.18)",
                    backgroundColor: "#ffffff",
                  }}
                  bodyStyle={{ padding: "32px 28px" }}
                >
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%", marginBottom: 24 }}
                  >
                    <Title
                      level={3}
                      style={{ margin: 0, color: "#1f2933", textAlign: "center" }}
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
                      rules={LoginRules.email}
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
                      rules={LoginRules.password}
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
