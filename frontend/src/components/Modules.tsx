import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Typography, Card, Empty, Input } from "antd";
import { BookOutlined, SearchOutlined } from "@ant-design/icons";
import { useTheme } from "./ThemeContext";

const { Title, Text } = Typography;

export const AVAILABLE_MODULES = [
  // Year 1
  { id: "cm12001", name: "Artificial Intelligence 1",          code: "CM12001", year: 1 },
  { id: "cm12002", name: "Computer Systems Architectures",     code: "CM12002", year: 1 },
  { id: "cm12003", name: "Programming 1",                      code: "CM12003", year: 1 },
  { id: "cm12004", name: "Discrete Mathematics and Databases", code: "CM12004", year: 1 },
  { id: "cm12005", name: "Programming 2",                      code: "CM12005", year: 1 },
  { id: "cm12006", name: "Mathematics for Computation",        code: "CM12006", year: 1 },
  // Year 2
  { id: "cm22007", name: "Software Engineering",                          code: "CM22007", year: 2 },
  { id: "cm22008", name: "Algorithms and Complexity",                     code: "CM22008", year: 2 },
  { id: "cm22009", name: "Machine Learning",                              code: "CM22009", year: 2 },
  { id: "cm22010", name: "Visual Computing",                              code: "CM22010", year: 2 },
  { id: "cm22011", name: "Human-Computer Interaction 1",                  code: "CM22011", year: 2 },
  { id: "cm22012", name: "Advanced Programming",                          code: "CM22012", year: 2 },
  { id: "cm22013", name: "Human-Computer Interaction 2",                  code: "CM22013", year: 2 },
  { id: "cm22014", name: "Cybersecurity",                                 code: "CM22014", year: 2 },
  { id: "cm22015", name: "Artificial Intelligence 2",                     code: "CM22015", year: 2 },
  { id: "cm22016", name: "Foundations and Frontiers of Machine Learning", code: "CM22016", year: 2 },
  { id: "cm22050", name: "Professional Placement",                        code: "CM22050", year: 2 },
  // Year 3
  { id: "cm32017", name: "Individual Project",                   code: "CM32017", year: 3 },
  { id: "cm32021", name: "Advanced Computer Graphics",           code: "CM32021", year: 3 },
  { id: "cm32022", name: "Advanced Computer Vision",             code: "CM32022", year: 3 },
  { id: "cm32023", name: "Advanced Human-Computer Interaction",  code: "CM32023", year: 3 },
  { id: "cm32024", name: "Bayesian Machine Learning",            code: "CM32024", year: 3 },
  { id: "cm32025", name: "Computational Complexity",             code: "CM32025", year: 3 },
  { id: "cm32027", name: "Entrepreneurship",                     code: "CM32027", year: 3 },
  { id: "cm32028", name: "Individual Project (Extended)",        code: "CM32028", year: 3 },
  { id: "cm32029", name: "Logic and Semantics",                  code: "CM32029", year: 3 },
  { id: "cm32030", name: "Natural Language Processing",          code: "CM32030", year: 3 },
  { id: "cm32032", name: "Reinforcement Learning",               code: "CM32032", year: 3 },
];

const YEARS = [1, 2, 3] as const;
const YEAR_LABELS: Record<number, string> = {
  1: "Year 1",
  2: "Year 2",
  3: "Year 3",
};

interface ModulesProps {
  onTitleClick?: () => void;
}

const Modules: React.FC<ModulesProps> = ({ onTitleClick }) => {
  const [search, setSearch] = useState("");
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const filtered = AVAILABLE_MODULES.filter(
    (mod) =>
      mod.name.toLowerCase().includes(search.toLowerCase()) ||
      mod.code.toLowerCase().includes(search.toLowerCase())
  );

  const hasResults = filtered.length > 0;

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

      {!hasResults ? (
        <Empty description={search ? "No modules match your search." : "No modules available."} />
      ) : (
        YEARS.map((year) => {
          const yearModules = filtered.filter((m) => m.year === year);
          if (yearModules.length === 0) return null;
          return (
            <div key={year} style={{ marginBottom: 32 }}>
              <Title level={5} style={{ color: isDark ? "#4da3ff" : "#0b5ed7", marginBottom: 12 }}>
                {YEAR_LABELS[year]}
              </Title>
              <Row gutter={[16, 16]}>
                {yearModules.map((mod) => (
                  <Col xs={24} sm={12} md={8} key={mod.id}>
                    <Card
                      hoverable
                      onClick={() => navigate(`/modules/${mod.code}`)}
                      style={{
                        borderRadius: 12,
                        boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(15,35,95,0.08)",
                        border: `2px solid ${isDark ? "#303030" : "transparent"}`,
                        background: isDark ? "#1f1f1f" : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <Title level={5} style={{ marginBottom: 4 }}>
                          {mod.name}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {mod.code}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })
      )}
    </section>
  );
};

export default Modules;
