import React, { useState } from 'react';
import { Button, Input, message, Form } from 'antd';
import { updatePassword } from '../services/api/changepassword'; 
import Cookies from 'js-cookie';

const ChangePasswordForm = ({ onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const values = form.getFieldsValue();
    const { currentPassword, newPassword, confirmPassword } = values;

    // Check for empty inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      message.error('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error('New password and confirm password do not match');
      return;
    }

    if (currentPassword === newPassword) {
      message.error('New password cannot be the same as the current password');
      return;
    }

    const token = Cookies.get('authToken');
    setLoading(true);

    try {
      const response = await updatePassword(token, { currentPassword, newPassword });
      
      if (response.success) {
        message.success('Password changed successfully!');
        onClose(); // Close the form after a successful save
      } else {
        message.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      message.error('Error occurred while changing password');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSave}>
      <Form.Item
        name="currentPassword"
        label="Current Password"
        rules={[{ required: true, message: 'Please input your current password!' }]}
      >
        <Input.Password 
          placeholder="Enter current password" 
          autoComplete="current-password" // Added autocomplete
          style={{ width: '300px' }} // Fixed width
        />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label="New Password"
        rules={[{ required: true, message: 'Please input your new password!' }]}
      >
        <Input.Password 
          placeholder="Enter new password" 
          autoComplete="new-password" // Added autocomplete
          style={{ width: '300px' }} // Fixed width
        />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        rules={[{ required: true, message: 'Please confirm your new password!' }]}
      >
        <Input.Password 
          placeholder="Confirm new password" 
          autoComplete="new-password" // Added autocomplete
          style={{ width: '300px' }} // Fixed width
        />
      </Form.Item>
      <Form.Item style={{ textAlign: 'center' }}> 
        <Button className="bg-lime-200 text-green-950" type="primary" htmlType="submit" loading={loading}>
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChangePasswordForm;
