import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Input, Form, message, Typography, Descriptions } from 'antd';
import Cookies from 'js-cookie';
import { fetchSecurityQuestion, updateSecurityQuestion } from '../../services/api/fetchSecurityQuestion';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';

const SecurityQuestion = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [securityData, setSecurityData] = useState({ question: '', answer: '' });
  const [loading, setLoading] = useState(false);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const { Text } = Typography;

  const securityQuestions = [
    'What is your mother\'s maiden name?',
    'What was the name of your first pet?',
    'What is your favorite color?',
    'In what city were you born?',
    'What is the name of your first school?',
    'What is your favorite movie?',
    'Who is your favorite author?',
    'What is the name of your best friend?',
    'What is your dream job?',
    'Where did you go on your last vacation?',
  ];

  const getAuthToken = () => {
    const userAuth = JSON.parse(localStorage.getItem('userAuth')) || JSON.parse(sessionStorage.getItem('userAuth'));
    const adminAuth = JSON.parse(localStorage.getItem('adminAuth')) || JSON.parse(sessionStorage.getItem('adminAuth'));
    
    const username = userAuth?.state?.userData?.username || adminAuth?.state?.userData?.username;
    if (!username) {
      message.error('User not authenticated!');
      return null;
    }

    let token = Cookies.get(`authToken_${username}`);
    if (!token) {
      token = userAuth?.state?.token || adminAuth?.state?.token;
      if (!token) {
        message.error('Authentication token is missing. Please log in again.');
        return null;
      }
    }
    return token;
  };

  useEffect(() => {
    const fetchUserSecurityQuestion = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetchSecurityQuestion(token);
        if (response.success) {
          setSecurityData({ question: response.security_question, answer: '' });
        } else {
          message.error(response.message || 'Failed to fetch security question.');
        }
      } catch (error) {
        message.error('Failed to fetch security question.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSecurityQuestion();
  }, []);

  const handleSubmit = async (values) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      const response = await updateSecurityQuestion(token, values.security_question, values.security_answer);
      if (response.success) {
        message.success('Security question updated successfully.');
        logUserActivity('Profile Update', `Updated security question: "${values.security_question}"`);
        logUserNotification('Security Question Updated', 'Your security question was successfully updated.');
        setIsEditing(false);
        setSecurityData({ question: values.security_question, answer: values.security_answer });
      } else {
        message.error(response.message || 'Failed to update security question.');
      }
    } catch (error) {
      message.error('Failed to update security question.');
    } finally {
      setLoading(false);
      form.resetFields();
    }
  };

  return (
    <Card className="flex flex-col w-full bg-[#A8E1C5] rounded-3xl shadow p-6 border-none">
      <div className="flex justify-center mb-4">
        <Text className="text-xl font-semibold">Security Question</Text>
      </div>
      {isEditing ? (
        <Form form={form} onFinish={handleSubmit} initialValues={securityData}>
          <Form.Item
            name="security_question"
            label="Select a Security Question"
            rules={[{ required: true, message: 'Please select a security question!' }]}
          >
            <Select placeholder="Select a security question">
              {securityQuestions.map((question, index) => (
                <Select.Option key={index} value={question}>
                  {question}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="security_answer"
            label="Security Answer"
            rules={[{ required: true, message: 'Please provide an answer!' }]}
          >
            <Input.Password placeholder="Enter your answer" />
          </Form.Item>
          <div className="flex justify-center">
            <Button onClick={() => setIsEditing(false)} className="bg-red-500 text-white mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} className="bg-lime-200 text-green-950 ml-2">
              Submit
            </Button>
          </div>
        </Form>
      ) : (
        <Descriptions column={1} layout="horizontal" bordered>
          <Descriptions.Item label="Current Security Question">
            {securityData.question || 'Not set'}
          </Descriptions.Item>
          <Descriptions.Item label="Security Answer">
            {securityData.answer ? '********' : '********'}
          </Descriptions.Item>
        </Descriptions>
      )}
      {!isEditing && (
        <div className="flex justify-center mt-4">
          <Button type="primary" onClick={() => setIsEditing(true)} className="bg-lime-200 text-green-950">
            Edit
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SecurityQuestion;
