import React, { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../../services/api/forgotPasswordApi';

const { Title, Text } = Typography;

const ForgotPassword = ({ className = "" }) => {
  const [step, setStep] = useState(1); // Step 1: Fetch question, Step 2: Validate and update
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const fetchSecurityQuestion = async (values) => {
    try {
      const response = await forgotPasswordApi({ username: values.username });
      if (response.success) {
        setUsername(values.username);
        setSecurityQuestion(response.security_question);
        setStep(2);
      } else {
        // Display an error message if the user has no security question or is not found
        message.error(response.message);
      }
    } catch (error) {
      console.error('Error fetching security question:', error);
      message.error('An error occurred. Please try again.');
    }
  };

  const resetPassword = async (values) => {
    try {
      const response = await forgotPasswordApi({
        username,
        security_answer: values.securityAnswer,
        newPassword: values.newPassword,
      });
      if (response.success) {
        message.success(response.message);
        navigate('/login', { replace: true });
      } else {
        message.error(response.message);
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      message.error('An error occurred. Please try again.');
    }
  };

  const onFinish = (values) => {
    if (step === 1) fetchSecurityQuestion(values);
    else resetPassword(values);
  };

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className={`flex flex-col items-center justify-center h-screen bg-honeydew overflow-hidden ${className}`}>
      <div className="mb-2">
        <img
          className="h-[183px] w-[171px] object-cover"
          loading="lazy"
          alt="Logo"
          src="/SINSSI_LOGO-removebg-preview.png"
        />
      </div>
      <div className="w-full max-w-[300px]">
        {/* Back to Login Button */}
        <Button
          type="link"
          onClick={handleBackToLogin}
          className="mb-4 flex justify-start"
          style={{ color: '#072c1c' }}
        >
          <img className="w-[9.3px] h-[9.3px] inline mr-1" loading="lazy" alt="Back" src="/chevron-back.svg" />
          Back to login
        </Button>

        {/* Title */}
        <Title level={1} className="text-center" style={{ color: '#072c1c' }}>
          {step === 1 ? 'Forgot Password' : 'Answer Security Question'}
        </Title>

        {/* Subtitle or Question */}
        {step === 1 ? (
          <Text className="text-center justify-center" style={{ color: '#072c1c', lineHeight: '1.5' }}>
            Enter your username to retrieve your security question.
          </Text>
        ) : (
          <Text className="text-center justify-center" style={{ color: '#072c1c', lineHeight: '1.5' }}>
            Please answer your security question to reset your password.
          </Text>
        )}

        {/* Form */}
        <Form onFinish={onFinish} className="mt-5 w-full max-w-[300px]">
          {step === 1 ? (
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your username' }]}
            >
              <Input placeholder="Username" className="h-[38px] custom-input" />
            </Form.Item>
          ) : (
            <>
              <Text style={{ display: 'block', marginBottom: '1rem', color: '#072c1c' }}>
                {securityQuestion}
              </Text>
              <Form.Item
                name="securityAnswer"
                rules={[{ required: true, message: 'Please input your answer' }]}
              >
                <Input placeholder="Security Answer" className="h-[38px] custom-input" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                rules={[{ required: true, message: 'Please input your new password' }]}
              >
                <Input.Password placeholder="New Password" className="h-[38px] custom-password-input" />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-palegoldenrod text-darkslategray-100 py-5 rounded-3xs shadow-md">
              {step === 1 ? 'Next' : 'Submit'}
            </Button>
          </Form.Item>
        </Form>
      </div>
      <img
        className="absolute bottom-0 left-0 w-full h-auto object-cover"
        alt="Background Vector"
        src="/vectors.svg"
      />
    </div>
  );
};

export default ForgotPassword;
