import { Input, Button, Form, Typography } from 'antd';
import 'antd/dist/reset.css'; // Resets Ant Design styles to avoid conflicts

const { Title } = Typography;

const Login = () => {
  const handleLogin = () => {
    // Handle login logic
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <Title level={2} className="text-center mb-6">Login</Title>
      <Form layout="vertical">
        <Form.Item label="Username">
          <div className="self-stretch rounded-3xs bg-[#2f4f4f] flex flex-row items-start justify-start pt-[25.1px] px-[34px] pb-[24.2px]">
            <Input
              placeholder="Enter your username"
              className="!bg-transparent !text-[#d4af37] !placeholder-[#d4af37] !text-sm !leading-[20px] !border-none !shadow-none"
            />
          </div>
        </Form.Item>
        <Form.Item label="Password">
          <div className="self-stretch rounded-3xs bg-[#2f4f4f] flex flex-row items-start justify-start pt-[25.1px] px-[34px] pb-[24.2px]">
            <Input
              placeholder="Enter your password"
              type="password"
              className="!bg-transparent !text-[#d4af37] !placeholder-[#d4af37] !text-sm !leading-[20px] !border-none !shadow-none"
            />
          </div>
        </Form.Item>
        <div className="w-full rounded-3xs bg-[#d4af37] flex flex-row items-center justify-center pt-[19.3px] px-5 pb-[30px]">
          <Button
            type="primary"
            onClick={handleLogin}
            className="!w-[74.1px] !bg-[#2f4f4f] !text-[#d4af37] !border-none !font-lexend-deca !shadow-none"
          >
            Login
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Login;
