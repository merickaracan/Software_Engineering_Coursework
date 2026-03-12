import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Typography,
  Card,
  Avatar,
  Descriptions,
  Button,
  Tag,
  Rate,
  Empty,
  Space,
  Upload,
  message,
  Spin,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LogoutOutlined,
  TrophyOutlined,
  FileTextOutlined,
  StarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import PageLayout from "../components/PageHeader";
import { useTheme } from "../components/ThemeContext";
import { logout } from "../api/auth";
import { getUser, updateProfilePicture } from "../api/users";

const { Title, Text } = Typography;
const { Content } = Layout;

interface Note {
  id: number;
  note_title: string;
  module: string;
  note_data: string;
  rating_average: number;
  number_ratings: number;
  verified: number;
}

interface LeaderboardEntry {
  email: string;
  name: string;
  avgRating: number;
  totalNotes: number;
}

const rankColors: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#E8913D",
};

const rankLabel = (rank: number) => {
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      localStorage.removeItem("user");
      message.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      // Still clear local storage even if logout fails
      localStorage.removeItem("user");
      message.success("Logged out successfully");
      navigate("/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const name = user?.name ?? "No name set";
  const email = user?.email ?? "No email set";

  const [notes, setNotes] = useState<Note[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [totalNotes, setTotalNotes] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const hasValidEmail = Boolean(email) && email !== "No email set";

    if (!hasValidEmail) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchProfileAndStats = async () => {
      setLoading(true);

      try {
        const [profileResponse, notesData, lbData] = await Promise.all([
          getUser(email),
          fetch(`/api/notes/email/${encodeURIComponent(email)}`, { credentials: "include" }).then((r) => r.json()),
          fetch("/api/notes/leaderboard", { credentials: "include" }).then((r) => r.json()),
        ]);

        if (!isMounted) {
          return;
        }

        if (profileResponse?.ok && Array.isArray(profileResponse.data) && profileResponse.data.length > 0) {
          setProfilePicture(profileResponse.data[0].profile_picture || null);
        } else {
          setProfilePicture(null);
        }

        const userNotes: Note[] = notesData?.data ?? [];
        setNotes(userNotes);

        const board: LeaderboardEntry[] = lbData?.data ?? [];
        const sorted = [...board].sort((a, b) => Number(b.avgRating) - Number(a.avgRating));
        const pos = sorted.findIndex((entry) => entry.email === email);

        if (pos !== -1) {
          setRank(pos + 1);
          setTotalNotes(sorted[pos].totalNotes);
          setAvgRating(Number(sorted[pos].avgRating));
        } else {
          setRank(null);
          setTotalNotes(userNotes.length);
          setAvgRating(0);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching profile data:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfileAndStats();

    return () => {
      isMounted = false;
    };
  }, [email]);

  const convertFileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadProfilePicture = async (file: File) => {
    if (!email || email === "No email set") {
      message.error("Unable to identify user");
      return false;
    }

    if (!file.type.startsWith("image/")) {
      message.error("Please select an image file");
      return false;
    }

    if (file.size > 2 * 1024 * 1024) {
      message.error("Image must be smaller than 2MB");
      return false;
    }

    try {
      setUploadingPicture(true);
      const dataUrl = await convertFileToDataUrl(file);
      const response = await updateProfilePicture(email, dataUrl);

      if (!response.ok) {
        message.error(response.error || "Failed to update profile picture");
        return false;
      }

      setProfilePicture(dataUrl);
      message.success("Profile picture updated");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      message.error("Failed to update profile picture");
    } finally {
      setUploadingPicture(false);
    }

    return false;
  };

  const handleRemoveProfilePicture = async () => {
    if (!email || email === "No email set") {
      message.error("Unable to identify user");
      return;
    }

    try {
      setUploadingPicture(true);
      const response = await updateProfilePicture(email, null);
      if (!response.ok) {
        message.error(response.error || "Failed to remove profile picture");
        return;
      }

      setProfilePicture(null);
      message.success("Profile picture removed");
    } catch (error) {
      console.error("Error removing profile picture:", error);
      message.error("Failed to remove profile picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: 12,
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
    border: isDark ? "1px solid #303030" : undefined,
    background: isDark ? "#1f1f1f" : "#fff",
    marginBottom: 24,
  };

  const rankBadgeColor = rank && rank <= 3 ? rankColors[rank] : isDark ? "#4da3ff" : "#0b5ed7";
  const rankTextColor = rank === 1 ? "#7A5800" : rank === 2 ? "#333" : "#fff";

  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <Row justify="center">
          <Col xs={24} md={18} lg={14}>

            {/* Profile header card */}
            <Card
              style={cardStyle}
              bodyStyle={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "32px",
              }}
            >
              <Avatar
                size={96}
                src={profilePicture || undefined}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#0b5ed7", marginBottom: 16 }}
              />
              <Space style={{ marginBottom: 12 }}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleUploadProfilePicture}
                >
                  <Button loading={uploadingPicture}>Change profile picture</Button>
                </Upload>
                {profilePicture && (
                  <Button danger onClick={handleRemoveProfilePicture} loading={uploadingPicture}>
                    Remove
                  </Button>
                )}
              </Space>
              <Title level={3} style={{ margin: 0 }}>
                {name}
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                {email}
              </Text>
            </Card>

            {/* Stats / Leaderboard rank card */}
            <Card
              title={
                <span>
                  <TrophyOutlined style={{ marginRight: 8, color: isDark ? "#4da3ff" : "#0b5ed7" }} />
                  Your Stats
                </span>
              }
              style={cardStyle}
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <Spin />
                </div>
              ) : (
                <Row gutter={[24, 16]} justify="center">
                  {/* Rank */}
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        backgroundColor: rankBadgeColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                        boxShadow: `0 4px 14px ${rankBadgeColor}88`,
                      }}
                    >
                      <Text strong style={{ fontSize: 22, color: rank && rank <= 3 ? rankTextColor : "#fff" }}>
                        {rank ? rankLabel(rank) : "—"}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Leaderboard Rank
                    </Text>
                  </Col>

                  {/* Notes shared */}
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        backgroundColor: isDark ? "#1a3a6e" : "#e6f0ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                      }}
                    >
                      <Text strong style={{ fontSize: 22, color: isDark ? "#4da3ff" : "#0b5ed7" }}>
                        {totalNotes}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Notes Shared
                    </Text>
                  </Col>

                  {/* Avg rating */}
                  <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        backgroundColor: isDark ? "#2a1f00" : "#fffbe6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                      }}
                    >
                      <Text strong style={{ fontSize: 22, color: "#faad14" }}>
                        {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Avg Rating
                    </Text>
                  </Col>
                </Row>
              )}
            </Card>

            {/* Student details */}
            <Card title="Student Details" style={cardStyle}>
              <Descriptions column={1} colon={false}>
                <Descriptions.Item label={<><UserOutlined style={{ marginRight: 8 }} />Name</>}>
                  {name}
                </Descriptions.Item>
                <Descriptions.Item label={<><MailOutlined style={{ marginRight: 8 }} />Email</>}>
                  {email}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Shared Notes */}
            <Card
              title={
                <span>
                  <FileTextOutlined style={{ marginRight: 8, color: isDark ? "#4da3ff" : "#0b5ed7" }} />
                  My Shared Notes
                </span>
              }
              style={cardStyle}
            >
              {loading ? (
                <div style={{ textAlign: "center", padding: 24 }}>
                  <Spin />
                </div>
              ) : notes.length === 0 ? (
                <Empty description="You haven't shared any notes yet." />
              ) : (
                <Row gutter={[16, 16]}>
                  {notes.map((note) => (
                    <Col xs={24} key={note.id}>
                      <Card
                        hoverable
                        onClick={() => navigate(`/note/${note.id}`)}
                        style={{
                          borderRadius: 10,
                          background: isDark ? "#141414" : "#f9fbff",
                          border: isDark ? "1px solid #303030" : "1px solid #e6eeff",
                          cursor: "pointer",
                        }}
                        bodyStyle={{ padding: "16px 20px" }}
                      >
                        <Row align="middle" justify="space-between" wrap>
                          <Col flex="auto">
                            <Row align="middle" gutter={8} style={{ marginBottom: 4 }}>
                              <Col>
                                <Text strong style={{ fontSize: 15 }}>
                                  {note.note_title || "Untitled Note"}
                                </Text>
                              </Col>
                              <Col>
                                <Tag color="blue" style={{ borderRadius: 6 }}>
                                  {note.module}
                                </Tag>
                                {note.verified ? (
                                  <Tag
                                    icon={<CheckCircleOutlined />}
                                    color="success"
                                    style={{ borderRadius: 6 }}
                                  >
                                    Verified
                                  </Tag>
                                ) : null}
                              </Col>
                            </Row>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              {note.note_data
                                ? note.note_data.length > 100
                                  ? note.note_data.slice(0, 100) + "…"
                                  : note.note_data
                                : "No content."}
                            </Text>
                          </Col>
                          <Col style={{ textAlign: "right", minWidth: 140, paddingLeft: 16 }}>
                            <Rate
                              disabled
                              allowHalf
                              value={Number(note.rating_average)}
                              style={{ fontSize: 14 }}
                            />
                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <StarOutlined style={{ marginRight: 4 }} />
                                {Number(note.rating_average).toFixed(1)} · {note.number_ratings}{" "}
                                {note.number_ratings === 1 ? "rating" : "ratings"}
                              </Text>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>

            {/* Actions */}
            <Card style={{ ...cardStyle, marginBottom: 0 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    style={{ backgroundColor: "#0b5ed7", borderColor: "#0b5ed7", borderRadius: 8 }}
                    onClick={() => navigate("/dashboard")}
                  >
                    Back to Dashboard
                  </Button>
                </Col>
                <Col xs={24} sm={12}>
                  <Button
                    danger
                    block
                    size="large"
                    icon={<LogoutOutlined />}
                    style={{ borderRadius: 8 }}
                    loading={logoutLoading}
                    onClick={handleLogout}
                  >
                    Log out
                  </Button>
                </Col>
              </Row>
            </Card>

          </Col>
        </Row>
      </Content>
    </PageLayout>
  );
};

export default Profile;
