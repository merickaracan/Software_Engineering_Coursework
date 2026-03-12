import React from "react";
import { Link } from "react-router-dom";
import {
  Layout,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Steps,
} from "antd";
import {
  FileTextOutlined,
  TrophyOutlined,
  BookOutlined,
  SunOutlined,
  MoonOutlined,
  UserAddOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useTheme } from "../components/ThemeContext";

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

const FEATURES = [
  {
    icon: <FileTextOutlined style={{ fontSize: 32 }} />,
    title: "Create & Share Notes",
    description: "Write, organise, and share notes with your fellow Bath students across all modules.",
  },
  {
    icon: <TrophyOutlined style={{ fontSize: 32 }} />,
    title: "Earn Points",
    description: "Get rewarded for contributing quality notes. Climb the leaderboard and stand out.",
  },
  {
    icon: <BookOutlined style={{ fontSize: 32 }} />,
    title: "Browse by Module",
    description: "Find notes filtered by your modules so you always study the right material.",
  },
];

const Home: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
    border: isDark ? "1px solid #303030" : undefined,
    background: isDark ? "#1f1f1f" : "#fff",
    textAlign: "center",
    padding: "8px 0",
    height: "100%",
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
      {/* Nav */}
      <Header
        style={{
          background: isDark ? "#1a3a6e" : "#0b5ed7",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          height: 80,
          boxShadow: isDark ? "0 2px 12px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Title level={4} style={{ margin: 0, color: "#fff", flex: 1 }}>
          Notebuddy
        </Title>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            onClick={toggleTheme}
            style={{ cursor: "pointer", fontSize: 20, color: "#fff", marginRight: 4 }}
          >
            {isDark ? <SunOutlined /> : <MoonOutlined />}
          </div>
          <Link to="/login">
            <Button
              icon={<LoginOutlined />}
              style={{
                borderRadius: 8,
                borderColor: "#fff",
                color: "#fff",
                background: "transparent",
              }}
            >
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              style={{
                borderRadius: 8,
                backgroundColor: isDark ? "#4da3ff" : "#fff",
                borderColor: isDark ? "#4da3ff" : "#fff",
                color: isDark ? "#fff" : "#0b5ed7",
                fontWeight: 600,
              }}
            >
              Register
            </Button>
          </Link>
        </div>
      </Header>

      <Content style={{ padding: "64px 32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <Title
            level={1}
            style={{
              color: "#fff",
              fontSize: 48,
              marginBottom: 16,
              textShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            Your Bath University Note Hub
          </Title>
          <Paragraph
            style={{
              color: "#dbe8ff",
              fontSize: 18,
              maxWidth: 560,
              margin: "0 auto 32px",
            }}
          >
            Create, share, and discover notes across all your modules.
            Study smarter with your peers on Notebuddy.
          </Paragraph>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Link to="/register">
              <Button
                type="primary"
                size="large"
                style={{
                  backgroundColor: isDark ? "#4da3ff" : "#fff",
                  borderColor: isDark ? "#4da3ff" : "#fff",
                  color: isDark ? "#fff" : "#0b5ed7",
                  borderRadius: 8,
                  height: 48,
                  fontWeight: 600,
                  fontSize: 16,
                  paddingInline: 32,
                }}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <Row gutter={[24, 24]} align="stretch" style={{ marginBottom: 72 }}>
          {FEATURES.map((f) => (
            <Col xs={24} md={8} key={f.title}>
              <Card style={cardStyle}>
                <div style={{ color: isDark ? "#4da3ff" : "#0b5ed7", marginBottom: 16 }}>
                  {f.icon}
                </div>
                <Title level={4} style={{ marginBottom: 8, color: isDark ? "#fff" : undefined }}>
                  {f.title}
                </Title>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  {f.description}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>

        {/* How it works */}
        <Card style={{ ...cardStyle, textAlign: "left", padding: "32px" }}>
          <Title level={3} style={{ marginBottom: 32, color: isDark ? "#fff" : undefined }}>
            How It Works
          </Title>
          <Steps
            direction="vertical"
            items={[
              {
                title: "Create an account",
                description: "Sign up with your @bath.ac.uk email address.",
              },
              {
                title: "Upload your notes",
                description: "Tag notes by module and share them with your course mates.",
              },
              {
                title: "Discover & rate",
                description: "Browse notes from others, rate the best ones, and earn points.",
              },
              {
                title: "Climb the leaderboard",
                description: "The more you contribute, the higher you rank.",
              },
            ]}
          />
        </Card>
      </Content>

      <Footer
        style={{
          textAlign: "center",
          color: isDark ? "#666" : "#a0b4d6",
          background: "transparent",
          paddingBottom: 32,
        }}
      >
        Notebuddy © {new Date().getFullYear()} · University of Bath
      </Footer>
    </Layout>
  );
};

export default Home;
