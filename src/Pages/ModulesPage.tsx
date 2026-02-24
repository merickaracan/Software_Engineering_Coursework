import React from "react";
import { Layout } from "antd";
import Modules from "../Components/Modules";
import PageLayout from "../Components/PageHeader";

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
