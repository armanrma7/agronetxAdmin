import { Modal, Form, Input, Select, Button, Switch, notification } from "antd";
import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";

export type CreateUserModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type UserType = "farmer" | "company" | "admin";

interface Region {
  id: string;
  name_am: string;
}

interface Village {
  id: string;
  name_am: string;
}

interface CreateUserFormValues {
  full_name: string;
  phone: string;
  password: string;
  user_type: UserType;
  region_id?: string;
  village_id?: string;
  is_locked: boolean;
}

export const CreateUserModal = ({ open, onClose, onCreated }: CreateUserModalProps) => {
  const [form] = Form.useForm<CreateUserFormValues>();
  const [loading, setLoading] = useState(false);
   const [regions, setRegions] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await apiClient.get<Region[]>("/regions");
        setRegions(Array.isArray(res.data) ? res.data : []);
      } catch (error: any) {
        notification.error({
          message: "Failed to load regions",
          description: error.response?.data?.message ?? "Unexpected error"
        });
      }
    })();
  }, [open]);

  const handleRegionChange = async (regionId: string) => {
    form.setFieldsValue({ region_id: regionId, village_id: undefined });
    if (!regionId) {
      setVillages([]);
      return;
    }
    try {
      const res = await apiClient.get<Village[]>(`/regions/${regionId}/villages`);
      setVillages(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      notification.error({
        message: "Failed to load villages",
        description: error.response?.data?.message ?? "Unexpected error"
      });
    }
  };

  const handleSubmit = async (values: CreateUserFormValues) => {
    setLoading(true);
    try {
      await apiClient.post("/auth/register", values);
      notification.success({ message: "User created" });
      form.resetFields();
      onCreated();
      onClose();
    } catch (error: any) {
      notification.error({
        message: "Failed to create user",
        description: error.response?.data?.message ?? "Unexpected error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create User" open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Full name"
          name="full_name"
          rules={[{ required: true, message: "Please enter full name" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ required: true, message: "Please enter phone" }]}
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
        <Form.Item
          label="User type"
          name="user_type"
          rules={[{ required: true, message: "Please select user type" }]}
        >
          <Select<UserType>
            options={[
              { label: "Farmer", value: "farmer" },
              { label: "Company", value: "company" },
              { label: "Admin", value: "admin" }
            ]}
          />
        </Form.Item>
        <Form.Item label="Region" name="region_id">
          <Select
            allowClear
            placeholder="Select region"
            options={regions.map((r) => ({ label: r.name_am, value: r.id }))}
            onChange={handleRegionChange}
          />
        </Form.Item>
        <Form.Item label="Village" name="village_id">
          <Select
            allowClear
            placeholder="Select village"
            options={villages.map((v) => ({ label: v.name_am, value: v.id }))}
          />
        </Form.Item>
        {/* <Form.Item label="Locked" name="is_locked" valuePropName="checked" initialValue={false}>
          <Switch />
        </Form.Item> */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Create
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

