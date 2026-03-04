import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Card, Tag, Empty, Input } from "antd";
import { BookOutlined, CheckCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { useTheme } from "./ThemeContext";

const { Title, Text } = Typography;

const AVAILABLE_MODULES = [
  { id: "se", name: "Software Engineering", code: "CM50109" },
  { id: "ml", name: "Machine Learning", code: "CM50264" },
  { id: "sa", name: "Systems Architecture", code: "CM50123" },
  { id: "vc", name: "Visual Computing", code: "CM50275" },
  { id: "db", name: "Databases", code: "CM50202" },
  { id: "ai", name: "Artificial Intelligence", code: "CM50170" },
];

interface ModulesProps {
  onTitleClick?: () => void;
}

const Modules: React.FC<ModulesProps> = ({ onTitleClick }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const { isDark } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("selectedModules");
    if (stored) {
      setSelected(JSON.parse(stored));
    }
  }, []);

  const toggleModule = (id: string) => {
    setSelected((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((m) => m !== id)
        : [...prev, id];
      localStorage.setItem("selectedModules", JSON.stringify(updated));
      return updated;
    });
  };

  const filtered = AVAILABLE_MODULES.filter(
    (mod) =>
      mod.name.toLowerCase().includes(search.toLowerCase()) ||
      mod.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section>
      <Row align="middle" justify="space-between" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <BookOutlined style={{ fontSize: 22, color: isDark ? "#4da3ff" : "#0b5ed7", marginRight: 10 }} />
          <Title
            level={3}
            style={{ margin: 0, cursor: onTitleClick ? "pointer" : undefined }}
            onClick={onTitleClick}
          >
            Modules
          </Title>
        </div>
        <Input
          placeholder="Search modules..."
          prefix={<SearchOutlined style={{ color: "#999" }} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 250, borderRadius: 8 }}
        />
      </Row>
      {filtered.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filtered.map((mod) => {
            const isSelected = selected.includes(mod.id);
            return (
              <Col xs={24} sm={12} md={8} key={mod.id}>
                <Card
                  hoverable
                  onClick={() => toggleModule(mod.id)}
                  style={{
                    borderRadius: 12,
                    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
                    border: isSelected
                      ? `2px solid ${isDark ? "#4da3ff" : "#0b5ed7"}`
                      : `2px solid ${isDark ? "#303030" : "transparent"}`,
                    background: isDark ? "#1f1f1f" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Title level={5} style={{ marginBottom: 4 }}>
                        {mod.name}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {mod.code}
                      </Text>
                    </div>
                    {isSelected && (
                      <Tag
                        icon={<CheckCircleOutlined />}
                        color="blue"
                        style={{ borderRadius: 6, marginLeft: 8 }}
                      >
                        Selected
                      </Tag>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <Empty description={search ? "No modules match your search." : "No modules available."} />
      )}
    </section>
  );
};

export default Modules;
