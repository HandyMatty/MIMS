import React, { useState, useEffect, useCallback } from 'react';
import { Button, message, notification } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useLoginAuth from '../../services/request/useLoginAuth';
import SINSSILogo from '../../../assets/SINSSI_LOGO-removebg-preview.png';
import vectors from '../../../assets/vectors.svg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { mutate, isLoading, error } = useLoginAuth();
  const navigate = useNavigate();

  
  // On mount, check if any auth data is already saved.
  // If so, immediately redirect to the corresponding dashboard.
  useEffect(() => {
    const storedAdminAuth = localStorage.getItem('adminAuth');
    const storedUserAuth = localStorage.getItem('userAuth');
    const storedGuestAuth = localStorage.getItem('guestAuth');
  
    if (storedAdminAuth) {
      navigate('/admin/dashboard', { replace: true });
    } else if (storedUserAuth) {
      navigate('/user/dashboard', { replace: true });
    } else if (storedGuestAuth) {
      navigate('/guest/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username) {
      message.warning('Please enter your username.');
      return;
    }

    if (!password) {
      message.warning('Please enter your password.');
      return;
    }

    try {
      const response = await mutate(username, password, rememberMe);
      if (response.success) {
        notification.success({
          message: `Welcome Back, ${username}!`,
          description: 'You have successfully logged in. Enjoy your session!',
          placement: 'topRight',
        });
        // Note: the mutate function (useLoginAuth hook) saves the auth info
        // and calls navigate() to redirect the user.
      } else {
        message.error(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      message.error('Login failed. Please try again.');
    }
  };

  const handleForgotPassword = useCallback(() => {
    navigate('/forgotpassword', { replace: true });
  }, [navigate]);

  return (
    <div className="relative w-full h-screen bg-honeydew">
      {/* Background Vector Image */}
      <img
        className="absolute bottom-0 left-0 w-full h-auto object-cover z-0"
        style={{ maxHeight: '100vh' }}
        src={vectors}
        alt="vector bg"
      />

      {/* Login Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <main className="flex flex-col items-center justify-center h-full p-4">
            <section className="w-full max-w-md bg-honeydew p-6 rounded-lg shadow-lg">
              <form onSubmit={handleLogin}>
                <div className="flex flex-col items-center mb-10">
                  <img
                    className="w-54 h-52 object-cover"
                    loading="lazy"
                    src={SINSSILogo}
                    alt="SINSSI Logo"
                  />
                  <h1 className="text-45xl font-lexend-deca text-darkslategray-100 text-center">
                    Sign in
                  </h1>
                </div>

                <div className="mb-4">
                  <input
                    id="username"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-darkslategray-100 text-palegoldenrod placeholder-palegoldenrod text-sm py-6 pl-2 rounded-3xs"
                    autoComplete="username"
                  />
                </div>

                <div className="mb-4 relative">
                  <input
                    id="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-darkslategray-100 text-palegoldenrod placeholder-palegoldenrod text-sm py-6 pl-2 rounded-3xs"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0 border-none bg-transparent cursor-pointer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {isPasswordVisible ? (
                      <EyeOutlined style={{ color: 'palegoldenrod' }} />
                    ) : (
                      <EyeInvisibleOutlined style={{ color: 'palegoldenrod' }} />
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-center mt-6">
                  <div className="flex justify-between w-full mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="rememberMe" className="text-sm font-montserrat text-darkslategray-100">
                        Remember me
                      </label>
                    </div>
                    <div
                      className="text-sm font-lexend-deca text-darkslategray-100 cursor-pointer"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </div>
                  </div>
                  <p className="text-center mt-4 text-darkslategray-100">
                    Sign in and start managing your inventory!
                  </p>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-2/4 mt-2 bg-palegoldenrod text-darkslategray-100 py-5 rounded-3xs shadow-md"
                    loading={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                  {error && <p className="text-red-500 text-center">{error}</p>}
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Login;
