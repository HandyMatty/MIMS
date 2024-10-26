import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import { loginApi } from '../../services/api/auth';
import Cookies from 'js-cookie';

const useLoginAuth = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { setUserData: setAdminUserData, setToken: setAdminToken, reset: resetAdmin } = useAdminAuthStore();
  const { setUserData: setUserUserData, setToken: setUserToken, reset: resetUser } = useUserAuthStore();

  const mutate = async (username, password, rememberMe) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginApi({ username, password });

      if (response.success) {
        const token = response.token;

        if (response.role === 'admin') {
          resetUser(); // Clear User auth to prevent overlap
          setAdminUserData({ username });
          setAdminToken(token);

          Cookies.set('authToken', token, {
            expires: rememberMe ? 7 : 1,
            secure: false, // Change to true if using HTTPS
            sameSite: 'Strict',
          });
          navigate('/admin/dashboard', { replace: true });
        } else if (response.role === 'user') {
          resetAdmin(); // Clear Admin auth to prevent overlap
          setUserUserData({ username });
          setUserToken(token);

          Cookies.set('authToken', token, {
            expires: rememberMe ? 7 : 1,
            secure: false,
            sameSite: 'Strict',
          });
          navigate('/user/dashboard', { replace: true });
        }
        return { success: true };  // Return success here
      } else {
        return { success: false, message: response.message || 'Login failed' };  // Return failure with message
      }
    } catch (error) {
      setError('Failed to log in. Please try again.');
      return { success: false, message: 'Login failed due to a network error.' };  // Return error for network issue
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
};

export default useLoginAuth;
