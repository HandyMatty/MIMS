import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/admin/useAuth';
import { useUserAuthStore } from '../../store/user/useAuth';
import { useGuestAuthStore } from '../../store/guest/useAuth';
import { loginApi } from '../../services/api/auth';
import Cookies from 'js-cookie';
import { useActivity } from '../../utils/ActivityContext';

const useLoginAuth = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { setUserData: setAdminUserData, setToken: setAdminToken, setRole: setAdminRole } = useAdminAuthStore();
  const { setUserData: setUserUserData, setToken: setUserToken, setRole: setUserRole } = useUserAuthStore();
  const { setUserData: setGuestUserData, setToken: setGuestToken, setRole: setGuestRole } = useGuestAuthStore();

  const { logUserActivity } = useActivity();

  const mutate = async (username, password, rememberMe) => {
    setIsLoading(true);
    setError(null);

    try {
      checkAndClearExpiredCookies();

      const response = await loginApi({ username, password, rememberMe });

      if (response.success) {
        const { token, role } = response;

        const authData = JSON.stringify({ userData: { username, role }, token });

        sessionStorage.setItem(`${role}Auth`, authData);

        localStorage.setItem(`${role}Auth`, authData);

        Cookies.set(`authToken_${username}`, token, {
          expires: rememberMe ? 7 : 1, 
          secure: window.location.protocol === 'https:',
          sameSite: 'Lax',
          path: '/'
        });

        if (role === 'admin') {
          setAdminUserData({ username });
          setAdminRole(role);
          setAdminToken(token);
          logUserActivity('Login', `This admin just logged in`, username);
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'user') {
          setUserUserData({ username });
          setUserRole(role);
          setUserToken(token);
          logUserActivity('Login', `This user just logged in`, username);
          navigate('/user/dashboard', { replace: true });
        } else if (role === 'guest') {
          setGuestUserData({ username });
          setGuestRole(role);
          setGuestToken(token);
          logUserActivity('Login', `This guest just logged in`, username);
          navigate('/guest/dashboard', { replace: true });
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

  const checkAndClearExpiredCookies = () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      if (cookieName.startsWith('authToken_') && !allCookies[cookieName]) {
        ['adminAuth', 'userAuth', 'guestAuth'].forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });

        Cookies.remove(cookieName);
      }
    });
  };

  return { mutate, isLoading, error };
};

export default useLoginAuth;
