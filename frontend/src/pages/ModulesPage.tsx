import React from "react";
import { Layout } from "antd";
import Modules from "../components/Modules";
import PageLayout from "../components/PageHeader";

const { Content } = Layout;

const ModulesPage: React.FC = () => {
  return (
    <PageLayout>
      <Content style={{ padding: "32px" }}>
        <Modules />
      </Content>
    </PageLayout>
  );
};

export default ModulesPage;
