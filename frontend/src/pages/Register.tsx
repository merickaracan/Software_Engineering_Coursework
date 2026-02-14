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
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Content } = Layout;

const RegistrationRules = {
  name: [
    { required: true, message: "Please enter your name." },
    { min: 2, message: "Name should be at least 2 characters." },
  ],
  email: [
    { required: true, message: "Please enter your email." },
    { type: "email", message: "Please enter a valid email address (e.g., user@bath.ac.uk)." },
    { pattern: /^[a-zA-Z0-9]+@bath\.ac\.uk$/, message: ""},
    // Also must check if email is already registed
  ],
  password: [
    { required: true, message: "Please enter your password." },
    { min: 8, message: "Password must be at least 8 characters." },
    { pattern: /[a-z]/, message: "Must contain at least one lowercase letter." },
    { pattern: /[A-Z]/, message: "Must contain at least one uppercase letter." },
    { pattern: /[0-9]/, message: "Must contain at least one number." },
    { pattern: /[!@#$%^&*(),.?":{}|<>]/, message: "Must contain at least one symbol." },
  ],
  confirmPassword: [
    { required: true, message: "Please confirm your password." },
    ({ getFieldValue }) => ({
      validator(_, value) {
        if (value && getFieldValue("password") === value) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Passwords do not match."));
      },
    }),
  ],
};

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    // Demo only – no backend call
    console.log("Register form submitted:", values);

    const { name, email, password } = values;

    const request = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await request.json();

    // Failure
    if (!request.ok) {
      const errorMessages = data.errors ? data.errors.join(",\n") : "Unknown error.";
      message.error(`Failed to create account: ${errorMessages}`);
      return;
    }

    console.log("Verification Link", data.verifyLink);

    // Success
    message.success("Account created (demo only – no real signup yet)");
    navigate("/login");
  };

  const onFinishFailed = () => {
    message.error("Please fix the errors in the form.");
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        width: "100%", 
        background: "linear-gradient(135deg, #0b5ed7 0%, #e9f2ff 60%)",
      }}
    >
      <Content style={{ padding: "40px 20px" }}>
        <Row
          justify="center"
          align="middle"
          style={{
            minHeight: "100vh",
            width: "100%", 
            padding: "0 4vw",
          }}
        >
          <Col xs={24} md={20} lg={16} xl={14}>
            <Row gutter={[32, 32]}>
              {/* Left panel – info / branding */}
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
                    Create your account
                  </Title>
                  <Text style={{ color: "#dbe8ff", fontSize: 14 }}>
                    Sign up to start sharing your notes and contributing to your
                    peers.
                  </Text>
                </Card>
              </Col>

              {/* Right panel – registration form */}
              <Col xs={24} md={12}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 16,
                    boxShadow: "0 18px 40px rgba(15, 35, 95, 0.18)",
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
                      style={{
                        margin: 0,
                        color: "#1f2933",
                        textAlign: "center",
                      }}
                    >
                      Sign up
                    </Title>
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, textAlign: "center" }}
                    >
                      Create an account to get started.
                    </Text>
                  </Space>

                  <Form<RegisterFormValues>
                    layout="vertical"
                    name="registerForm"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                  >
                    <Form.Item
                      label="Name"
                      name="name"
                      rules={RegistrationRules.name}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Your full name"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Email"
                      name="email"
                      rules={RegistrationRules.email}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="ab1234@bath.ac.uk"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Password"
                      name="password"
                      rules={RegistrationRules.password}
                      hasFeedback
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Create a strong password"
                        size="large"
                        visibilityToggle={{
                          visible: passwordVisible,
                          onVisibleChange: setPasswordVisible,
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Confirm password"
                      name="confirmPassword"
                      dependencies={["password"]}
                      hasFeedback
                      rules={RegistrationRules.confirmPassword}
                    >
                      <Input.Password
                        prefix={<CheckCircleOutlined />}
                        placeholder="Repeat your password"
                        size="large"
                        visibilityToggle={{
                          visible: passwordVisible,
                          onVisibleChange: setPasswordVisible,
                        }}
                      />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 8 }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        block
                        style={{
                          backgroundColor: "#0b5ed7",
                          borderColor: "#0b5ed7",
                          borderRadius: 8,
                        }}
                      >
                        Create account
                      </Button>
                    </Form.Item>
                  </Form>

                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Already have an account?{" "}
                      <a href="/login" style={{ color: "#0b5ed7", fontWeight: 500 }}>
                        Back to login
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

export default Register;
