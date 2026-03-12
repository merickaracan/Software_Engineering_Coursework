import React, { useEffect, useState } from "react";
import { Layout, Row, Typography, Card, Rate, Table, Tag } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";

const { Title, Text } = Typography;
const { Content } = Layout;

interface LeaderboardEntry {
  name: string;
  email: string;
  avgRating: number;
  totalNotes: number;
}

const rankColors: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#E8913D",
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
    fetch("/api/notes/leaderboard", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { data?: LeaderboardEntry[] }) => setLeaderboard(data?.data ?? []))
      .catch(() => setLeaderboard([]));
  }, []);

  const sorted = [...leaderboard].sort((a, b) => Number(b.avgRating) - Number(a.avgRating));

  const textColor = isDark ? "#d9d9d9" : "rgba(0,0,0,0.88)";
  const secondaryColor = isDark ? "#8c8c8c" : "rgba(0,0,0,0.45)";

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
              style={{
                backgroundColor: rankColors[rank],
                fontWeight: 700,
                fontSize: 15,
                color: rank === 1 ? "#7A5800" : rank === 2 ? "#333" : "#fff",
                border: "none",
                borderRadius: 6,
                padding: "4px 14px",
              }}
            >
              {rankLabels[rank]}
            </Tag>
          );
        }
        return <Text style={{ fontWeight: 500, fontSize: 15, paddingLeft: 10, color: textColor }}>{rank}th</Text>;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong style={{ fontSize: 15, color: textColor }}>{name}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <Text style={{ fontSize: 14, color: textColor }}>{email}</Text>,
    },
    {
      title: "Total Notes Shared",
      dataIndex: "totalNotes",
      key: "totalNotes",
      render: (count: number) => <Text style={{ fontSize: 15, color: textColor }}>{count}</Text>,
    },
    {
      title: "Avg Rating per Note",
      dataIndex: "avgRating",
      key: "avgRating",
      render: (rating: number) => (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Rate disabled allowHalf value={Number(rating)} style={{ fontSize: 18 }} />
          <Text style={{ fontSize: 14, color: secondaryColor }}>{Number(rating).toFixed(1)}</Text>
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
