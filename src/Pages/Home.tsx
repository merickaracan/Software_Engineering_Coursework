import "../styles/Home.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";


import {
    Layout,
    Button,
    Typography,
    Carousel,
    Steps,
} from "antd";

const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;

const Home = () => {
    return (
        <Layout style={{minHeight: "100vh"}}>
            <Header style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                    display: "flex",
                    gap: "15px",
                    alignItems: "center",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    width: "100%",
                }}>
                    <Button>App Icon</Button>
                    <Text 
                    style={{
                        color: "#fff",
                        fontSize: "20px" }}>
                    Welcome to the Home Page
                    </Text>

                    <div style={{
                        display: "flex",
                        gap: "20px",
                        marginLeft: "auto",
                    }}>
                        <Link to="/login"><Button>Log in</Button></Link>
                        <Link to="/register"><Button>Register</Button></Link>
                    </div>
                </div>
            </Header>
            <Content style={{ 
                display:"flex", 
                flexDirection: "column", 
                maxWidth: "1200px", 
                margin: "0 auto", 
                padding: "20px", 
                gap: "48px"
                }}>
                <Title level={1}>Welcome to Notebuddy</Title>
                <Text>
                    Notebuddy is your personal note-taking companion. 
                    Create, organize, and manage your Bath notes with ease.
                </Text>
                
                <Carousel arrows={true}>
                    <div className="home-carousel-div"><h1>Display 1 slide - Insert image + description</h1></div>
                    <div className="home-carousel-div"><h1>Display 2 slide</h1></div>
                    <div className="home-carousel-div"><h1>Display 3 slide</h1></div>
                </Carousel>

                <Title level={2} style={{ marginTop: "40px" }}>How It Works</Title>
                <Steps
                    items={[
                        { title: "Sign Up", description: "Create your free account" },
                        { title: "Start Noting", description: "Begin creating notes" },
                        { title: "Organize", description: "Categorize your notes", },
                        { title: "Sync", description: "Access everywhere" },
                    ]}
                />

                <Text style={{fontSize: "24px"}}>Some additional information or description can go here.</Text>

            </Content>
            <Footer style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
                Anything can go here
            </Footer>
        </Layout>
    );
};

export default Home;