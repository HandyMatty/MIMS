import { useState } from 'react';
import { Button, Input, message, Form, Typography, Card, Divider } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { updatePassword } from '../../services/api/changepassword';
import Cookies from 'js-cookie';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useTheme } from '../../utils/ThemeContext';

const { Title } = Typography;

const ChangePasswordForm = ({ onClose = () => {} }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const { theme, currentTheme } = useTheme();
  const [cancelBtnHover, setCancelBtnHover] = useState(false);
  const [saveBtnHover, setSaveBtnHover] = useState(false);


  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { currentPassword, newPassword } = values;

      if (currentPassword === newPassword) {
        message.error('New password cannot be the same as the current password');
        return;
      }

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
        form.resetFields();
        setIsVisible(false);
        onClose();
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
    form.resetFields();
    setIsVisible(false);
  };

  return (
    <Card className="flex flex-col justify-center items-center w-auto bg-[#a7f3d0] rounded-xl shadow border-none"
      style={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}>
      <div className="flex flex-col items-center justify-center min-h-[515px]">
        <div className='flex flex-col justify-center items-center rounded-xl bg-honeydew shadow p-6'
          style={currentTheme !== 'default' ? { background: theme.textLight } : {}}>
          <LockOutlined style={{ fontSize: '60px', color: currentTheme !== 'default' ? theme.text : '#072C1C'}}/>
          <Divider style={currentTheme !== 'default' ? {borderColor: theme.text} : {borderColor: '#072C1C'}}>
            <Title level={3} className="w-40 text-wrap text-center text-lgi sm:text-sm font-bold" style={currentTheme !== 'default' ? { color: theme.text } : {}}>Change Password</Title>
          </Divider>
          {!isVisible ? (
            <Button
              type="primary"
              className="bg-lime-200 text-green-950 w-auto text-wrap mt-10"
              icon={<LockOutlined />}
              onClick={() => setIsVisible(true)}
              style={currentTheme !== 'default' ? {
                background: saveBtnHover ? theme.textLight : theme.text,
                color: saveBtnHover ? theme.text : theme.textLight,
                border: 'none',
                transition: 'background 0.2s, color 0.2s'
              } : {}}
              onMouseEnter={currentTheme !== 'default' ? () => setSaveBtnHover(true) : undefined}
              onMouseLeave={currentTheme !== 'default' ? () => setSaveBtnHover(false) : undefined}
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
                    style={currentTheme !== 'default' ? {
                      background: cancelBtnHover ? theme.text : theme.sider,
                      color: cancelBtnHover ? theme.textLight : theme.text,
                      border: 'none',
                      transition: 'background 0.2s, color 0.2s'
                    } : {}}
                    onMouseEnter={currentTheme !== 'default' ? () => setCancelBtnHover(true) : undefined}
                    onMouseLeave={currentTheme !== 'default' ? () => setCancelBtnHover(false) : undefined}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-lime-200 text-green-950 w-auto"
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={currentTheme !== 'default' ? {
                      background: saveBtnHover ? theme.sider : theme.text,
                      color: saveBtnHover ? theme.text : theme.textLight,
                      border: 'none',
                      transition: 'background 0.2s, color 0.2s'
                    } : {}}
                    onMouseEnter={currentTheme !== 'default' ? () => setSaveBtnHover(true) : undefined}
                    onMouseLeave={currentTheme !== 'default' ? () => setSaveBtnHover(false) : undefined}
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