import { useState } from 'react';
import { Button, Input, message, Form, Typography, Card, Divider } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { updatePassword } from '../../services/api/changepassword';
import Cookies from 'js-cookie';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const { Title } = Typography;

const ChangePasswordForm = ({ onClose = () => {} }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();


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
        logUserNotification( 'Password Update', 'Your password was successfully updated.' )
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
    <Card  className="flex flex-col justify-center items-center w-auto bg-[#A8E1C5] rounded-xl shadow border-none">
      <div className="flex flex-col items-center justify-center min-h-[515px]">
        <div className='flex flex-col justify-center items-center
         bg-[#EAF4E2] rounded-xl shadow p-6'>
        <LockOutlined style={{ fontSize: '60px', color: '#072C1C'}}/>
     <Divider style={{borderColor: '#072C1C'}}> <Title level={3} className="w-40 text-wrap text-center text-lgi sm:text-sm font-bold">Change Password</Title></Divider>
      {!isVisible ? (
        <Button 
          type="primary" 
          className="bg-lime-200 text-green-950 w-auto text-wrap mt-10"
          icon={<LockOutlined />} 
          onClick={() => setIsVisible(true)}
        >
          Change Password
        </Button>
      ) : (
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSave}
          className="w-auto mt-10"
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please input your current password!' }]}
          >
            <Input.Password 
              placeholder="Enter current password" 
              autoComplete="current-password"
              className="w-full bg-white text-xs sm:text-sm" 
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
              className="w-full bg-white text-xs sm:text-sm" 
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
              className="w-full bg-white text-xs sm:text-sm" 
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'center' }}>
          <div className='flex justify-center sm:flex-row mt-5'>
          <Button 
              className="mr-2 bg-red-500 text-white w-auto" 
              type="default" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              className="bg-lime-200 text-green-950 w-auto" 
              type="primary" 
              htmlType="submit" 
              loading={loading}
            >
              Save
            </Button>
            </div>
          </Form.Item>
        </Form>
      )}
        </div>
      </div>
    </Card>
  );
};

export default ChangePasswordForm;
