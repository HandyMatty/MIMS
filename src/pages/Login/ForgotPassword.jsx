import React from 'react';
import { Button, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../../services/api/forgotPasswordApi';

const { Title, Text } = Typography;

const ForgotPassword = ({ className = "" }) => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await forgotPasswordApi(values); 
      if (response.success) {
        navigate("/temporarypassword", { 
          state: { temporaryPassword: response.temporaryPassword },
          replace: true // Prevent adding a new entry to the history stack
        });
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error('Error during password recovery:', error);
      alert('An error occurred. Please try again.');
    }
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
        <Button
          type="link"
          onClick={handleBackToLogin}
          className="mb-4 flex justify-start"
          style={{ color: '#072c1c' }}
        >
          <img className="w-[9.3px] h-[9.3px] inline mr-1" loading="lazy" alt="Back" src="/chevron-back.svg" />
          Back to login
        </Button>
      
        <Title
          level={1}
          className="text-center"
          style={{
            color: '#072c1c',
            overflow: 'hidden',
            textAlign: 'center',
          }}
        >
          Forgot your password?
        </Title>
        
        <Text
          className="text-center justify-center"
          style={{
            color: '#072c1c',
            lineHeight: '1.5',
            maxWidth: '280px',
            margin: '0 auto',
            display: 'block',
          }}
        >
          Don’t worry, happens to all of us. <br />
          Enter your username below to recover your password.
        </Text>
      
        <Form onFinish={onFinish} className="mt-5 w-full max-w-[300px]">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username' }]}
          >
            <Input
              placeholder="Username"
              className="h-[38px] custom-input"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full bg-palegoldenrod text-darkslategray-100 py-5 rounded-3xs shadow-md">
              Submit
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
