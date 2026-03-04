export interface CSModule {
  code: string;
  name: string;
  level: "Year 1" | "Year 2" | "Year 3" | "Postgraduate";
}

export const CS_MODULES: CSModule[] = [
  // Year 1
  { code: "CM12001", name: "Artificial Intelligence 1", level: "Year 1" },
  { code: "CM12002", name: "Computer Systems Architectures", level: "Year 1" },
  { code: "CM12003", name: "Programming 1", level: "Year 1" },
  { code: "CM12004", name: "Discrete Mathematics and Databases", level: "Year 1" },
  { code: "CM12005", name: "Programming 2", level: "Year 1" },
  { code: "CM12006", name: "Mathematics for Computation", level: "Year 1" },
  // Year 2
  { code: "CM22007", name: "Software Engineering", level: "Year 2" },
  { code: "CM22008", name: "Algorithms and Complexity", level: "Year 2" },
  { code: "CM22009", name: "Machine Learning", level: "Year 2" },
  { code: "CM22010", name: "Visual Computing", level: "Year 2" },
  { code: "CM22011", name: "Human-Computer Interaction 1", level: "Year 2" },
  { code: "CM22012", name: "Advanced Programming", level: "Year 2" },
  { code: "CM22014", name: "Cybersecurity", level: "Year 2" },
  { code: "CM22015", name: "Artificial Intelligence 2", level: "Year 2" },
  // Year 3
  { code: "CM30072", name: "Safety-Critical Computer Systems", level: "Year 3" },
  { code: "CM30073", name: "Advanced Algorithms and Complexity", level: "Year 3" },
  { code: "CM30075", name: "Advanced Computer Graphics", level: "Year 3" },
  { code: "CM30080", name: "Computer Vision", level: "Year 3" },
  { code: "CM30141", name: "Theory of Human-Computer Interaction", level: "Year 3" },
  { code: "CM30173", name: "Cryptography", level: "Year 3" },
  { code: "CM30225", name: "Parallel Computing", level: "Year 3" },
  { code: "CM30226", name: "Logic and Semantics of Programming Languages", level: "Year 3" },
  { code: "CM30320", name: "Natural Language Processing", level: "Year 3" },
  { code: "CM30359", name: "Reinforcement Learning", level: "Year 3" },
  // Postgraduate (MSc)
  { code: "CM50109", name: "Software Engineering (MSc)", level: "Postgraduate" },
  { code: "CM50121", name: "Safety Critical Systems (MSc)", level: "Postgraduate" },
  { code: "CM50200", name: "Mobile and Pervasive Systems", level: "Postgraduate" },
  { code: "CM50210", name: "Cryptography (MSc)", level: "Postgraduate" },
  { code: "CM50258", name: "Principles of Programming", level: "Postgraduate" },
  { code: "CM50259", name: "Databases", level: "Postgraduate" },
  { code: "CM50260", name: "Foundations of Computation", level: "Postgraduate" },
  { code: "CM50262", name: "Functional Programming", level: "Postgraduate" },
  { code: "CM50263", name: "Artificial Intelligence (MSc)", level: "Postgraduate" },
  { code: "CM50264", name: "Machine Learning 1", level: "Postgraduate" },
  { code: "CM50265", name: "Machine Learning 2", level: "Postgraduate" },
  { code: "CM50266", name: "Applied Data Science", level: "Postgraduate" },
  { code: "CM50268", name: "Bayesian Machine Learning", level: "Postgraduate" },
  { code: "CM50269", name: "Neural Computation", level: "Postgraduate" },
  { code: "CM50272", name: "Humans and Intelligent Machines", level: "Postgraduate" },
  { code: "CM50275", name: "Advanced Programming (MSc)", level: "Postgraduate" },
];
