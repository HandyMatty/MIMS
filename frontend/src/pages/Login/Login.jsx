import { useState, useEffect, useCallback, Suspense } from 'react';
import { Button, Spin, App } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useLoginAuth from '../../services/request/useLoginAuth';
import SINSSILogo from '../../../assets/SINSSI_LOGO-removebg-preview.png';
import vectors from '../../../assets/vectors.svg';
import { LazyImage, preloadImages } from '../../utils/imageHelpers.jsx';

const Login = () => {
  const { message } = App.useApp();
  const { notification } = App.useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { mutate, isLoading, error } = useLoginAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    // Preload critical images
    preloadImages([SINSSILogo, vectors]);
  }, []);

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
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-honeydew">
        <Spin size="large" />
        <p className="mt-4 text-darkslategray-200">Loading...</p>
      </div>
    }>
      <div className="relative flex flex-col items-center justify-center h-screen bg-honeydew overflow-hidden">
        {/* Background Vector Image */}
        <LazyImage
          className="absolute bottom-0 left-0 w-full h-auto object-cover z-0"
          style={{ maxHeight: '100vh' }}
          src={vectors}
          alt="vector bg"
        />

        {/* Login Container */}
        <div className="relative z-10 w-auto h-auto sm:w-full sm:h-full flex items-center justify-center">
          <div className="w-full max-w-5xl">
            <main className="flex flex-col items-center justify-center h-full p-4">
              <section className="w-auto sm:w-full max-w-md bg-honeydew p-6 rounded-lg shadow-lg">
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col items-center mb-10">
                    <LazyImage
                      className="w-auto h-auto sm:w-[130px] sm:h-[130px ] object-contain"
                      src={SINSSILogo}
                      alt="SINSSI Logo"
                    />
                    <h1 className="text-32xl mt-5 sm:text-45xl font-lexend-deca text-darkslategray-100 text-center">
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
                      className="w-full bg-darkslategray-100 text-palegoldenrod placeholder-palegoldenrod text-xs sm:text-sm py-6 pl-2 rounded-3xs"
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
                      className="w-full bg-darkslategray-100 text-palegoldenrod placeholder-palegoldenrod text-xs sm:text-sm py-6 pl-2 rounded-3xs"
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
                        <label htmlFor="rememberMe" className="text-xs sm:text-sm font-montserrat text-darkslategray-100">
                          Remember me
                        </label>
                      </div>
                      <div
                        className="text-xs sm:text-sm font-lexend-deca text-darkslategray-100 cursor-pointer"
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </div>
                    </div>
                    <p className="text-center mt-4 text-darkslategray-100 ">
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
    </Suspense>
  );
};

export default Login;