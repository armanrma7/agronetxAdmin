import { Card, Col, Row, Statistic, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../api/client";

const { Title, Paragraph } = Typography;

interface CountResponse {
  total: number;
}

export const DashboardPage = () => {
  const { data: announcements } = useQuery({
    queryKey: ["announcements-count"],
    queryFn: async () => {
      const res = await apiClient.get<CountResponse | any>("/announcements", {
        params: { limit: 1, page: 1 }
      });
      if ("total" in res.data) return res.data as CountResponse;
      if (Array.isArray(res.data)) return { total: res.data.length };
      return { total: 0 };
    }
  });

  const { data: applications } = useQuery({
    queryKey: ["applications-count"],
    queryFn: async () => {
      const res = await apiClient.get<CountResponse | any>("/applications", {
        params: { limit: 1, page: 1 }
      });
      if ("total" in res.data) return res.data as CountResponse;
      if (Array.isArray(res.data)) return { total: res.data.length };
      return { total: 0 };
    }
  });

  const { data: favorites } = useQuery({
    queryKey: ["favorites-count"],
    queryFn: async () => {
      const res = await apiClient.get<any[]>("/favorites");
      return { total: Array.isArray(res.data) ? res.data.length : 0 };
    }
  });

  return (
    <>
      <Title level={3}>Overview</Title>
      <Paragraph type="secondary">
        High-level summary of activity in the Agonetix system.
      </Paragraph>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Announcements" value={announcements?.total ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Applications" value={applications?.total ?? 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Favorites" value={favorites?.total ?? 0} />
          </Card>
        </Col>
      </Row>
    </>
  );
};

