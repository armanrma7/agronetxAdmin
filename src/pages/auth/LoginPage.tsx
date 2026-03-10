import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography, notification } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "../../api/client";
import { useAuth } from "../../state/auth/useAuth";
import type { AuthTokens, AuthUser } from "../../types/auth";

const { Title } = Typography;

interface LoginFormValues {
  phone: string;
  password: string;
}

export const LoginPage = () => {
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", values);
      const tokens: AuthTokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };
      const user: AuthUser = {
        id: response.data.user.id,
        phone: response.data.user.phone,
        fullName: response.data.user.full_name,
        userType: response.data.user.user_type
      };
      login(user, tokens);
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (error: any) {
      notification.error({
        message: "Login failed",
        description: error.response?.data?.message ?? "Invalid credentials"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5"
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Admin Login
        </Title>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input placeholder="+374..." />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

