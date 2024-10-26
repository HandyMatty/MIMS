import React from 'react';
import { Button, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const TemporaryPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { temporaryPassword } = location.state || {}; // Retrieve the temporary password from state

  const handleBackToLogin = () => {
    navigate("/login", { replace: true }); // Navigate back without adding to history stack
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-honeydew overflow-hidden">
      <div className="mb-2">
        <img
          className="h-[183px] w-[171px] object-cover"
          loading="lazy"
          alt="Logo"
          src="/SINSSI_LOGO-removebg-preview.png"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-full max-w-[300px]">
        <Title level={1} className="m-0 text-inherit font-semibold text-center" style={{ color: '#072c1c' }}>
          Temporary Password
        </Title>
        <Text className="w-full text-center mb-4" style={{ opacity: 0.75 }}>
          Copy or write your temporary password and make sure to change your password after logging in with your temporary password.
        </Text>
        <div className="self-stretch rounded-lg bg-input-base flex flex-row items-start justify-center py-[7.5px] px-5 text-mini text-darkslategray-200 mb-4">
          <div className="relative inline-block min-w-[64px] text-center">
            <strong>{temporaryPassword || 'No temporary password generated.'}</strong>
          </div>
        </div>
        <Button
          type="link"
          onClick={handleBackToLogin}
          className="flex items-center justify-center"
          style={{ color: '#072c1c' }}
        >
          <img className="w-[9.3px] h-[9.3px] inline mr-1" loading="lazy" alt="Back" src="/chevron-back1.svg" />
          Back to login
        </Button>
      </div>
      <img
        className="absolute bottom-0 left-0 w-full h-auto object-cover"
        alt="Background Vector"
        src="/vectors.svg"
      />
    </div>
  );
};

export default TemporaryPassword;
