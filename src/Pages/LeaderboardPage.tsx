import React, { useEffect, useState } from "react";
import { Layout, Row, Typography, Card, Rate, Table, Tag } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import PageLayout from "../Components/PageHeader";
import { useTheme } from "../Components/ThemeContext";

const { Title, Text } = Typography;
const { Content } = Layout;

interface LeaderboardEntry {
  name: string;
  email: string;
  avgRating: number;
  totalNotes: number;
}

const rankColors: Record<number, string> = {
  1: "#ffeb00",
  2: "#C0C0C0",
  3: "#CD7F32",
};

const rankLabels: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
};

const LeaderboardPage: React.FC = () => {
  const { isDark } = useTheme();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("leaderboard");
    if (stored) {
      setLeaderboard(JSON.parse(stored));
    }
  }, []);

  const sorted = [...leaderboard].sort((a, b) => b.avgRating - a.avgRating);

  const columns = [
    {
      title: "Rank",
      key: "rank",
      width: 90,
      render: (_: unknown, __: unknown, index: number) => {
        const rank = index + 1;
        if (rank <= 3) {
          return (
            <Tag
              color={rankColors[rank]}
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: rank === 2 ? "#333" : "#fff",
                border: "none",
                borderRadius: 6,
                padding: "4px 14px",
              }}
            >
              {rankLabels[rank]}
            </Tag>
          );
        }
        return <Text style={{ fontWeight: 500, fontSize: 15, paddingLeft: 10 }}>{rank}th</Text>;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong style={{ fontSize: 15 }}>{name}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <Text style={{ fontSize: 14 }}>{email}</Text>,
    },
    {
      title: "Total Notes Shared",
      dataIndex: "totalNotes",
      key: "totalNotes",
      render: (count: number) => <Text style={{ fontSize: 15 }}>{count}</Text>,
    },
    {
      title: "Avg Rating per Note",
      dataIndex: "avgRating",
      key: "avgRating",
      render: (rating: number) => (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Rate disabled allowHalf value={rating} style={{ fontSize: 18 }} />
          <Text type="secondary" style={{ fontSize: 14 }}>{rating.toFixed(1)}</Text>
        </span>
      ),
    },
  ];

  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <section>
          <Row align="middle" style={{ marginBottom: 20 }}>
            <TrophyOutlined style={{ fontSize: 28, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 12 }} />
            <Title level={2} style={{ margin: 0 }}>Leaderboard</Title>
          </Row>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
              border: isDark ? "1px solid #303030" : undefined,
              background: isDark ? "#1f1f1f" : "#fff",
            }}
          >
            <Table
              dataSource={sorted}
              columns={columns}
              rowKey="email"
              pagination={false}
              size="large"
              locale={{ emptyText: "No students yet. Students will appear here as they share notes and receive ratings." }}
            />
          </Card>
        </section>
      </Content>
    </PageLayout>
  );
};

export default LeaderboardPage;
