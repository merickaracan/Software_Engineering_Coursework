import React from "react";
import { Layout, Row, Col, Typography, Card, Empty } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import PageLayout from "../Components/PageHeader";
import { useTheme } from "../Components/ThemeContext";

const { Title, Text } = Typography;
const { Content } = Layout;

const MyNotesPage: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <section>
          <Row align="middle" style={{ marginBottom: 24 }}>
            <FileTextOutlined style={{ fontSize: 26, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 12 }} />
            <Title level={2} style={{ margin: 0 }}>My Notes</Title>
          </Row>
          <Row gutter={[16, 16]}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Col xs={24} sm={12} md={8} key={i}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 12,
                    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
                    border: isDark ? "1px solid #303030" : undefined,
                    background: isDark ? "#1f1f1f" : "#fff",
                    minHeight: 150,
                  }}
                >
                  <Title level={5} style={{ marginBottom: 8 }}>
                    Note {i}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    This is a placeholder for note content. Replace with real data.
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
          {false && (
            <Empty description="You have no notes yet." style={{ marginTop: 48 }} />
          )}
        </section>
      </Content>
    </PageLayout>
  );
};

export default MyNotesPage;
