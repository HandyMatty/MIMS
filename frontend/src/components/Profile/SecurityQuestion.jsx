import { useState, useEffect } from 'react';
import { Card, Button, Select, Input, Form, message, Descriptions, Divider } from 'antd';
import Cookies from 'js-cookie';
import { fetchSecurityQuestion, updateSecurityQuestion } from '../../services/api/fetchSecurityQuestion';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useTheme } from '../../utils/ThemeContext';

const SecurityQuestion = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [securityData, setSecurityData] = useState({ question: '', answer: '' });
  const [loading, setLoading] = useState(false);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const { theme, currentTheme } = useTheme();
  const [cancelBtnHover, setCancelBtnHover] = useState(false);
  const [submitBtnHover, setSubmitBtnHover] = useState(false);

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
    <Card className="flex flex-col w-full bg-[#a7f3d0] rounded-3xl shadow p-6 border-none"
      style={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}>
      <div className="flex justify-center mb-4">
        <Divider style={currentTheme !== 'default' ? {borderColor: theme.text} : {borderColor: '#072C1C'}} className="text-xl font-semibold">Security Question</Divider>
      </div>
      {isEditing ? (
        <Form form={form} onFinish={handleSubmit} initialValues={securityData}>
          <Form.Item
            name="security_question"
            label="Select a Security Question"
            rules={[{ required: true, message: 'Please select a security question!' }]}
          >
            <Select
              placeholder="Select a security question"
              style={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}
              dropdownStyle={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}
            >
              {securityQuestions.map((question, index) => (
                <Select.Option key={index} value={question} style={currentTheme !== 'default' ? { background: 'white', color: theme.text } : {}}>
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
            <Input.Password placeholder="Enter your answer" style={currentTheme !== 'default' ? { background: 'white', color: theme.text } : {}} />
          </Form.Item>
          <div className="flex justify-center">
            <Button onClick={() => setIsEditing(false)} className="bg-red-500 text-white mr-2"
              style={currentTheme !== 'default' ? {
                background: cancelBtnHover ? theme.textLight : theme.text,
                color: cancelBtnHover ? theme.text : theme.textLight,
                border: 'none',
                transition: 'background 0.2s, color 0.2s'
              } : {}}
              onMouseEnter={currentTheme !== 'default' ? () => setCancelBtnHover(true) : undefined}
              onMouseLeave={currentTheme !== 'default' ? () => setCancelBtnHover(false) : undefined}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} className="bg-lime-200 text-green-950 ml-2"
              style={currentTheme !== 'default' ? {
                background: submitBtnHover ? theme.text : theme.textLight,
                color: submitBtnHover ? theme.textLight : theme.text,
                border: 'none',
                transition: 'background 0.2s, color 0.2s'
              } : {}}
              onMouseEnter={currentTheme !== 'default' ? () => setSubmitBtnHover(true) : undefined}
              onMouseLeave={currentTheme !== 'default' ? () => setSubmitBtnHover(false) : undefined}
            >
              Submit
            </Button>
          </div>
        </Form>
      ) : (
        <Descriptions column={1} layout="horizontal" bordered className='text-nowrap overflow-auto w-auto'>
          <Descriptions.Item label="Current Security Question"
            style={currentTheme !== 'default' ? { color: theme.text, background: theme.componentBackground } : {}}>
            {securityData.question || 'Not set'}
          </Descriptions.Item>
          <Descriptions.Item label="Security Answer"
            style={currentTheme !== 'default' ? { color: theme.text, background: theme.componentBackground } : {}}>
            {securityData.answer ? '********' : '********'}
          </Descriptions.Item>
        </Descriptions>
      )}
      {!isEditing && (
        <div className="flex justify-center mt-4">
          <Button type="primary" onClick={() => setIsEditing(true)} className="bg-lime-200 text-green-950"
            style={currentTheme !== 'default' ? {
              background: submitBtnHover ? theme.text : theme.textLight,
              color: submitBtnHover ? theme.textLight : theme.text,
              border: 'none',
              transition: 'background 0.2s, color 0.2s'
            } : {}}
            onMouseEnter={currentTheme !== 'default' ? () => setSubmitBtnHover(true) : undefined}
            onMouseLeave={currentTheme !== 'default' ? () => setSubmitBtnHover(false) : undefined}
          >
            Edit
          </Button>
        </div>
      )}
    </Card>
  );
};

export default SecurityQuestion;