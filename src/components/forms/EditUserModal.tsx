import { Modal, Form, Input, Select, Switch, Button, notification } from "antd";
import { useEffect, useState } from "react";
import { apiClient } from "../../api/client";

type UserType = "farmer" | "company" | "admin";
type UserStatus = "active" | "blocked" | "inactive" | "pending";

export interface EditUserModalUser {
  id: string;
  phone: string;
  full_name?: string;
  user_type?: UserType;
  user_status?: UserStatus;
  is_locked?: boolean;
}

export interface EditUserModalProps {
  open: boolean;
  user: EditUserModalUser | null;
  onClose: () => void;
  onUpdated: () => void;
}

interface EditUserFormValues {
  full_name: string;
  phone: string;
  user_type: UserType;
  user_status: UserStatus;
  is_locked: boolean;
}

export const EditUserModal = ({ open, user, onClose, onUpdated }: EditUserModalProps) => {
  const [form] = Form.useForm<EditUserFormValues>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      form.setFieldsValue({
        full_name: user.full_name ?? "",
        phone: user.phone,
        user_type: user.user_type ?? "farmer",
        user_status: user.user_status ?? "active",
        is_locked: Boolean(user.is_locked)
      });
    }
  }, [user, open, form]);

  const handleSubmit = async (values: EditUserFormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      await apiClient.patch(`/admin/users/${user.id}`, {
        full_name: values.full_name,
        phone: values.phone,
        user_type: values.user_type,
        user_status: values.user_status,
        is_locked: values.is_locked
      });
      notification.success({ message: "User updated" });
      onUpdated();
      onClose();
    } catch (error: any) {
      notification.error({
        message: "Failed to update user",
        description: error.response?.data?.message ?? "Unexpected error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit User" open={open} onCancel={onClose} footer={null} destroyOnClose>
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
          <Input />
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
        <Form.Item
          label="Account status"
          name="user_status"
          rules={[{ required: true, message: "Please select account status" }]}
        >
          <Select<UserStatus>
            options={[
              { label: "Active", value: "active" },
              { label: "Blocked", value: "blocked" },
              { label: "Inactive", value: "inactive" },
              { label: "Pending", value: "pending" }
            ]}
          />
        </Form.Item>
        <Form.Item label="Locked" name="is_locked" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Save changes
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

