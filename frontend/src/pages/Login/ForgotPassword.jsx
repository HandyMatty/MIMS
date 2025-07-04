import { Suspense, useState, useEffect } from 'react';
import { Button, Form, Input, Typography, App, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '../../services/api/forgotPasswordApi';
import SINSSILogo from "../../../assets/SINSSI_LOGO-removebg-preview.png";
import back from "../../../assets/chevron-back.svg";
import vectors from "../../../assets/vectors.svg";
import { LazyImage, preloadImages } from '../../utils/imageHelpers.jsx';

const { Title, Text } = Typography;

const ForgotPassword = ({ className = "" }) => {
  const { message } = App.useApp();
  useEffect(() => {
    preloadImages([SINSSILogo]);
  }, []);
  const [step, setStep] = useState(1);
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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-honeydew">
        <LazyImage
          className="h-[183px] w-[171px] object-cover mb-4 logo-bounce"
          src={SINSSILogo}
          alt="SINSSI Logo"
          width={171}
          height={183}
        />
        <Spin size="large" />
        <p className="mt-4 text-darkslategray-200">Loading...</p>
      </div>
    }>
      <div className={`relative flex flex-col items-center justify-center h-screen bg-honeydew overflow-hidden ${className}`}>
        {/* Background Vector */}
        <img
          className="absolute bottom-0 left-0 w-full h-auto object-cover z-0"
          style={{ maxHeight: '100vh' }}
          src={vectors}
          alt="vector bg"
        />

        {/* Form Section */}
        <section className="w-auto sm:w-full max-w-sm sm:max-w-md bg-honeydew p-6 
      rounded-lg shadow-lg z-10 flex flex-col items-center">
          {/* Logo Centered */}
          <div className="mb-6 flex justify-center">
            <img
              className="w-auto h-auto sm:h-[133px] sm:w-[121px] object-cover"
              loading="lazy"
              src={SINSSILogo} alt="SINSSI Logo"
            />
          </div>

          <div className="w-auto sm:w-full sm:max-w-[400px]">
            {/* Back to Login Button */}
            <Button
              type="link"
              onClick={handleBackToLogin}
              className="mb-4 flex justify-start text-xs sm:text-sm"
              style={{ color: '#072c1c' }}
            >
              <img className="w-auto h-auto sm:w-[9.3px] sm:h-[9.3px]" loading="lazy" alt="Back" src={back}/>
              Back to login
            </Button>

            {/* Title */}
            <Title level={1} className="text-center" style={{ color: '#072c1c' }}>
              <span className='text-xl sm:text-5xl-6'>{step === 1 ? 'Forgot Password' : 'Answer Security Question'}</span>
            </Title>

            {/* Subtitle or Question */}
            {step === 1 ? (
              <Text className="text-center text-xs sm:text-sm justify-center" style={{ color: '#072c1c', lineHeight: '1.5' }}>
                Enter your username to retrieve your security question.
              </Text>
            ) : (
              <Text className="text-center text-xs sm:text-sm flex justify-center" style={{ color: '#072c1c', lineHeight: '1.5' }}>
                Please answer your security question to reset your password.
              </Text>
            )}

            {/* Form */}
            <Form onFinish={onFinish} className="mt-5 w-auto">
              {step === 1 ? (
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Please input your username' }]}
                >
                  <Input placeholder="Username" className="h-auto custom-input justify-self-center flex" />
                </Form.Item>
              ) : (
                <>
                  <Text style={{ display: 'block', marginBottom: '1rem', color: '#072c1c' }} className='text-sm'>
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
                <Button type="primary" htmlType="submit" className="w-1/3 flex justify-self-center bg-palegoldenrod
                 text-darkslategray-100 py-5 rounded-3xs shadow-md">
                  {step === 1 ? 'Next' : 'Submit'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </section>
      </div>
    </Suspense>
  );
};

export default ForgotPassword;