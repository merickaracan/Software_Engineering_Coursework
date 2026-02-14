import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    Layout,
    Button,
    Typography,
    Spin,
    Result,
} from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Content } = Layout;

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            const email = searchParams.get("email");
            const token = searchParams.get("token");

            if (!token) {
                setStatus("error");
                setMessage("No verification token found in URL.");
                return;
            }

            try {
                const response = await fetch(`/api/confirm?email=${encodeURIComponent(email)}&token=${token}`);
                const data = await response.json();

                if (data.ok) {
                    setStatus("success");
                    setMessage(data.message || "Email verified successfully!");
                } else {
                    setStatus("error");
                    setMessage(data.message || "Verification failed.");
                }
            } catch {
                setStatus("error");
                setMessage("Failed to connect to server. Please try again later.");
            }
        };

        verifyEmail();
    }, [searchParams]);

    return (
        <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
            <Content style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center",
                padding: "50px"
            }}>
                {status === "loading" && (
                    <div style={{ textAlign: "center" }}>
                        <Spin 
                            indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} 
                            size="large" 
                        />
                        <Title level={3} style={{ marginTop: 20 }}>
                            Verifying your email...
                        </Title>
                    </div>
                )}

                {status === "success" && (
                    <Result
                        status="success"
                        icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                        title="Email Verified Successfully!"
                        subTitle={message}
                        extra={[
                            <Link to="/login" key="login">
                                <Button type="primary" size="large">
                                    Go to Login
                                </Button>
                            </Link>,
                            <Link to="/" key="home">
                                <Button size="large">
                                    Go to Home
                                </Button>
                            </Link>
                        ]}
                    />
                )}

                {status === "error" && (
                    <Result
                        status="error"
                        icon={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                        title="Verification Failed"
                        subTitle={message}
                        extra={[
                            <Link to="/register" key="register">
                                <Button type="primary" size="large">
                                    Register Again
                                </Button>
                            </Link>,
                            <Link to="/" key="home">
                                <Button size="large">
                                    Go to Home
                                </Button>
                            </Link>
                        ]}
                    />
                )}
            </Content>
        </Layout>
    );
};

export default VerifyEmail;