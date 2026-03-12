import React, { useEffect, useState } from "react";
import { Row, Typography, Card, Rate, Table, Tag } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import { useTheme } from "./ThemeContext";

const { Title, Text } = Typography;

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

interface LeaderboardProps {
  onTitleClick?: () => void;
  limit?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onTitleClick, limit }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { isDark } = useTheme();

  useEffect(() => {
    fetch("/api/notes/leaderboard", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { data?: LeaderboardEntry[] }) => setLeaderboard(data?.data ?? []))
      .catch(() => setLeaderboard([]));
  }, []);

  const sorted = [...leaderboard].sort((a, b) => Number(b.avgRating) - Number(a.avgRating));
  const displayData = limit ? sorted.slice(0, limit) : sorted;

  const textColor = isDark ? "#d9d9d9" : "rgba(0,0,0,0.88)";
  const secondaryColor = isDark ? "#8c8c8c" : "rgba(0,0,0,0.45)";

  const columns = [
    {
      title: "Rank",
      key: "rank",
      width: 80,
      render: (_: unknown, __: unknown, index: number) => {
        const rank = index + 1;
        if (rank <= 3) {
          return (
            <Tag
              style={{
                backgroundColor: rankColors[rank],
                fontWeight: 700,
                fontSize: 14,
                color: rank === 1 ? "#7A5800" : rank === 2 ? "#333" : "#fff",
                border: "none",
                borderRadius: 6,
                padding: "2px 10px",
              }}
            >
              {rankLabels[rank]}
            </Tag>
          );
        }
        return <Text style={{ fontWeight: 500, paddingLeft: 8, color: textColor }}>{rank}th</Text>;
      },
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong style={{ color: textColor }}>{name}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <Text style={{ fontSize: 13, color: textColor }}>{email}</Text>,
    },
    {
      title: "Total Notes Shared",
      dataIndex: "totalNotes",
      key: "totalNotes",
      render: (count: number) => <Text style={{ color: textColor }}>{String(count)}</Text>,
    },
    {
      title: "Avg Rating per Note",
      dataIndex: "avgRating",
      key: "avgRating",
      render: (rating: number) => (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Rate disabled allowHalf value={Number(rating)} style={{ fontSize: 16 }} />
          <Text style={{ fontSize: 13, color: secondaryColor }}>{Number(rating).toFixed(1)}</Text>
        </span>
      ),
    },
  ];

  return (
    <section style={{ marginBottom: 48 }}>
      <Row align="middle" style={{ marginBottom: 16 }}>
        <TrophyOutlined style={{ fontSize: 22, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 10 }} />
        <Title
          level={3}
          style={{ margin: 0, cursor: onTitleClick ? "pointer" : undefined }}
          onClick={onTitleClick}
        >
          Leaderboard
        </Title>
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
          dataSource={displayData}
          columns={columns}
          rowKey="email"
          pagination={false}
          size="middle"
          locale={{ emptyText: "No students yet. Ratings will appear as notes get reviewed." }}
        />
      </Card>
    </section>
  );
};

export default Leaderboard;
