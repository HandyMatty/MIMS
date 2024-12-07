import React, { useState } from 'react';
import { Button, Input, message, Form, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { updatePassword } from '../../services/api/changepassword';
import Cookies from 'js-cookie';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import { useActivity } from '../../utils/ActivityContext';


const { Title } = Typography;

const ChangePasswordForm = ({ onClose = () => {} }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  const { logUserActivity } = useActivity();


  const handleSave = async () => {
    try {
      const values = await form.validateFields(); // Validate inputs
      const { currentPassword, newPassword } = values;

      if (currentPassword === newPassword) {
        message.error('New password cannot be the same as the current password');
        return;
      }

      // Determine the current user's username and token
      const username = adminAuth.userData?.username || userAuth.userData?.username;
      if (!username) {
        message.error('User not authenticated!');
        return;
      }

      const token = Cookies.get(`authToken_${username}`);
      if (!token) {
        message.error('Authentication token not found!');
        return;
      }

      setLoading(true);

      const response = await updatePassword(token, { currentPassword, newPassword });

      if (response.success) {
        message.success('Password changed successfully!');
        form.resetFields(); // Clear inputs
        setIsVisible(false); // Close the form
        onClose(); // Trigger onClose if provided
        logUserActivity(username, 'Password', `This user changed password`);
      } else {
        message.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      message.error(error.message || 'Error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields(); // Clear inputs
    setIsVisible(false); // Hide the form
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#A8E1C5] rounded-xl">
      <div className="bg-lime-200 p-3 rounded-full">
        <LockOutlined style={{ fontSize: '70px', color: '#072C1C' }} />
      </div>
      <Title level={3} className="mt-5">Change Password</Title>

      {!isVisible ? (
        <Button 
          type="primary" 
          className="bg-lime-200 text-green-950 mb-4" 
          onClick={() => setIsVisible(true)}
        >
          Change Password
        </Button>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="w-96"
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please input your current password!' }]}
          >
            <Input.Password 
              placeholder="Enter current password" 
              autoComplete="current-password"
              className="w-full bg-white" 
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[{ required: true, message: 'Please input your new password!' }]}
          >
            <Input.Password 
              placeholder="Enter new password" 
              autoComplete="new-password"
              className="w-full bg-white" 
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              placeholder="Confirm new password" 
              autoComplete="new-password"
              className="w-full bg-white" 
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'center' }}>
            <Button 
              className="bg-lime-200 text-green-950" 
              type="primary" 
              htmlType="submit" 
              loading={loading}
            >
              Save
            </Button>
            <Button 
              className="ml-2" 
              type="default" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default ChangePasswordForm;
