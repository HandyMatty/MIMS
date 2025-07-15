import { useState, useEffect } from 'react';
import { Card, Button, Select, Input, Form, App, Descriptions, Divider } from 'antd';
import Cookies from 'js-cookie';
import { fetchSecurityQuestion, updateSecurityQuestion } from '../../services/api/fetchSecurityQuestion';
import { useActivity } from '../../utils/ActivityContext';
import { useNotification } from '../../utils/NotificationContext';
import { useTheme } from '../../utils/ThemeContext';

const dropdownStyles = `
  .custom-dropdown .ant-select-dropdown {
    background: var(--dropdown-bg) !important;
    color: var(--dropdown-text) !important;
  }
  .custom-dropdown .ant-select-item {
    color: var(--dropdown-text) !important;
  }
  .custom-dropdown .ant-select-item-option-selected {
    background: var(--dropdown-selected-bg) !important;
  }
  .custom-dropdown .ant-select-item-option-active {
    background: var(--dropdown-hover-bg) !important;
  }
`;

const SecurityQuestion = () => {
  const { message } = App.useApp();
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
    const styleElement = document.createElement('style');
    styleElement.textContent = dropdownStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    if (currentTheme !== 'default') {
      document.documentElement.style.setProperty('--dropdown-bg', theme.componentBackground);
      document.documentElement.style.setProperty('--dropdown-text', theme.text);
      document.documentElement.style.setProperty('--dropdown-selected-bg', theme.textLight);
      document.documentElement.style.setProperty('--dropdown-hover-bg', theme.textLight);
    }

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
  }, [currentTheme, theme]);

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
        <Form form={form} onFinish={handleSubmit} initialValues={securityData} layout="vertical" className="w-full">
          <Form.Item
            name="security_question"
            label={<span className="text-sm font-medium">Select a Security Question</span>}
            rules={[{ required: true, message: 'Please select a security question!' }]}
            className="mb-4"
          >
            <Select
              placeholder="Select a security question"
              size="large"
              className="w-full"
              style={currentTheme !== 'default' ? { background: theme.componentBackground, color: theme.text } : {}}
              classNames={currentTheme !== 'default' ? { popup: { root: 'custom-dropdown' } } : {}}
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
            label={<span className="text-sm font-medium">Security Answer</span>}
            rules={[{ required: true, message: 'Please provide an answer!' }]}
            className="mb-6"
          >
            <Input.Password 
              placeholder="Enter your answer" 
              size="large"
              className="w-full"
              style={currentTheme !== 'default' ? { background: 'white', color: theme.text } : {}} 
            />
          </Form.Item>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button 
              onClick={() => setIsEditing(false)} 
              size="large"
              className="bg-red-500 text-white flex-1 sm:flex-none"
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
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              size="large"
              className="bg-lime-200 text-green-950 flex-1 sm:flex-none"
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
        <Descriptions 
          column={{ xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }} 
          layout="vertical" 
          bordered 
          className='w-full'
          size="small"
        >
          <Descriptions.Item 
            label={<span className="text-sm font-medium">Current Security Question</span>}
            style={currentTheme !== 'default' ? { color: theme.text, background: theme.componentBackground } : {}}
          >
            <span className="text-sm break-words">{securityData.question || 'Not set'}</span>
          </Descriptions.Item>
          <Descriptions.Item 
            label={<span className="text-sm font-medium">Security Answer</span>}
            style={currentTheme !== 'default' ? { color: theme.text, background: theme.componentBackground } : {}}
          >
            <span className="text-sm">********</span>
          </Descriptions.Item>
        </Descriptions>
      )}
      {!isEditing && (
        <div className="flex justify-center mt-4">
          <Button 
            type="primary" 
            onClick={() => setIsEditing(true)} 
            size="large"
            className="bg-lime-200 text-green-950 w-full sm:w-auto"
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