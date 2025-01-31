import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import { loginApi } from '../../services/api/auth';
import Cookies from 'js-cookie';
import { useActivity } from '../../utils/ActivityContext';

const useLoginAuth = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { setUserData: setAdminUserData, setToken: setAdminToken, setRole: setAdminRole, reset: resetAdmin } = useAdminAuthStore();
  const { setUserData: setUserUserData, setToken: setUserToken, setRole: setUserRole, reset: resetUser } = useUserAuthStore();

  const { logUserActivity } = useActivity();

  const mutate = async (username, password, rememberMe) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginApi({ username, password });

      if (response.success) {
        const token = response.token;
        const role = response.role;

        // Handle role-based logic (admin or user)
        if (role === 'admin') {
          resetUser();
          setAdminUserData({ username });
          setAdminRole(role);
          setAdminToken(token);

          logUserActivity(username, 'Login', `This user just logged in`);

          // Choose storage based on rememberMe
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('adminAuth', JSON.stringify({ userData: { username, role }, token }));

          // Set cookies for persistence
          Cookies.set(`authToken_${username}`, token, {
            expires: rememberMe ? 7 : 1, // 7 days if Remember Me, else 1 day
            secure: false, // Set true if you're using HTTPS
            sameSite: 'Strict',
          });

          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'user') {
          resetAdmin();
          setUserUserData({ username });
          setUserRole(role);
          setUserToken(token);

          logUserActivity(username, 'Login', `This user just logged in`);

          // Choose storage based on rememberMe
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('userAuth', JSON.stringify({ userData: { username, role }, token }));

          // Set cookies for persistence
          Cookies.set(`authToken_${username}`, token, {
            expires: rememberMe ? 7 : 1, // 7 days if Remember Me, else 1 day
            secure: false, // Set true if you're using HTTPS
            sameSite: 'Strict',
          });

          navigate('/user/dashboard', { replace: true });
        }

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      setError('Failed to log in. Please try again.');
      return { success: false, message: 'Login failed due to a network error.' };
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
};

export default useLoginAuth;
