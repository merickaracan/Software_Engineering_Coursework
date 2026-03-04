import React from "react";
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
  Select,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CheckCircleOutlined,
  SunOutlined,
  MoonOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useTheme } from "../Components/ThemeContext";

const { Title, Text } = Typography;
const { Content } = Layout;

const BATH_MAJORS = [
  // Faculty of Engineering & Design
  { value: "Architecture", label: "Architecture" },
  { value: "Chemical Engineering", label: "Chemical Engineering" },
  { value: "Civil Engineering", label: "Civil Engineering" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Electronic & Electrical Engineering", label: "Electronic & Electrical Engineering" },
  { value: "Integrated Mechanical & Electrical Engineering", label: "Integrated Mechanical & Electrical Engineering" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Product Design & Management", label: "Product Design & Management" },
  // Faculty of Humanities & Social Sciences
  { value: "Economics", label: "Economics" },
  { value: "Education", label: "Education" },
  { value: "Modern Languages & European Studies", label: "Modern Languages & European Studies" },
  { value: "Politics, Languages & International Studies", label: "Politics, Languages & International Studies" },
  { value: "Psychology", label: "Psychology" },
  { value: "Social Policy", label: "Social Policy" },
  { value: "Sociology", label: "Sociology" },
  // Faculty of Science
  { value: "Biochemistry", label: "Biochemistry" },
  { value: "Biology", label: "Biology" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Mathematics", label: "Mathematics" },
  { value: "Natural Sciences", label: "Natural Sciences" },
  { value: "Pharmacy & Pharmacology", label: "Pharmacy & Pharmacology" },
  { value: "Physics", label: "Physics" },
  { value: "Statistics", label: "Statistics" },
  // School of Management
  { value: "Accounting & Finance", label: "Accounting & Finance" },
  { value: "Business Administration", label: "Business Administration" },
  { value: "Management", label: "Management" },
  // Other
  { value: "Sports & Exercise Science", label: "Sports & Exercise Science" },
  { value: "Nursing", label: "Nursing" },
];

interface RegisterFormValues {
  name: string;
  email: string;
  major: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const onFinish = (values: RegisterFormValues) => {
    // Save to persistent registered users store (demo – no backend)
    const stored = localStorage.getItem("registeredUsers");
    const registeredUsers: Record<string, { name: string; email: string; major: string }> =
      stored ? JSON.parse(stored) : {};

    registeredUsers[values.email] = {
      name: values.name,
      email: values.email,
      major: values.major,
    };
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    console.log("Register form submitted:", values);
    message.success("Account created successfully!");

    setTimeout(() => {
      navigate("/");
    }, 800);
  };

  const onFinishFailed = () => {
    message.error("Please fix the errors in the form.");
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        width: "100%", 
        background: isDark
          ? "linear-gradient(135deg, #0a1628 0%, #141414 60%)"
          : "linear-gradient(135deg, #0b5ed7 0%, #e9f2ff 60%)",
      }}
    >
      <Content style={{ padding: "40px 20px", position: "relative" }}>
        <div
          onClick={toggleTheme}
          style={{
            position: "absolute",
            top: 0,
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
                    alignItems: "center",
                    height: "100%",
                    padding: "32px",
                  }}
                >
                  <Title level={2} style={{ color: "#fff", marginBottom: 16, textAlign: "center" }}>
                    Create your account
                  </Title>
                  <Text style={{ color: "#dbe8ff", fontSize: 14, textAlign: "center" }}>
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
                      style={{
                        margin: 0,
                        color: isDark ? "#fff" : "#1f2933",
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
                      rules={[
                        { required: true, message: "Please enter your name." },
                        {
                          min: 2,
                          message: "Name should be at least 2 characters.",
                        },
                      ]}
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
                      rules={[
                        { required: true, message: "Please enter your email." },
                        {
                          type: "email",
                          message: "Please enter a valid email.",
                        },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="ab1234@bath.ac."
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Major"
                      name="major"
                      rules={[{ required: true, message: "Please select your major." }]}
                    >
                      <Select
                        placeholder="Select your major"
                        size="large"
                        showSearch
                        optionFilterProp="label"
                        suffixIcon={<BookOutlined />}
                        options={BATH_MAJORS}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[
                        { required: true, message: "Please enter a password." },
                        {
                          min: 8,
                          message: "Password must be at least 8 characters.",
                        },
                        {
                          pattern: /[A-Z]/,
                          message: "Must contain at least one uppercase letter.",
                        },
                        {
                          pattern: /[a-z]/,
                          message: "Must contain at least one lowercase letter.",
                        },
                        {
                          pattern: /[0-9]/,
                          message: "Must contain at least one number.",
                        },
                      ]}
                      hasFeedback
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Create a strong password"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Confirm password"
                      name="confirmPassword"
                      dependencies={["password"]}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your password.",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("The passwords do not match.")
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<CheckCircleOutlined />}
                        placeholder="Repeat your password"
                        size="large"
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
                      <a href="/" style={{ color: "#0b5ed7", fontWeight: 500 }}>
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
