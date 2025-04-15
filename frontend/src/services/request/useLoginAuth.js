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
      // Clear expired cookies if necessary
      checkAndClearExpiredCookies();

      const response = await loginApi({ username, password, rememberMe });

      if (response.success) {
        const { token, role } = response;

        // Prepare auth data
        const authData = JSON.stringify({ userData: { username, role }, token });

        // Store data in sessionStorage **always**
        sessionStorage.setItem(`${role}Auth`, authData);

        // Store data in localStorage **always**
        localStorage.setItem(`${role}Auth`, authData);

        // Store the auth token in cookies (expiration varies)
        Cookies.set(`authToken_${username}`, token, {
          expires: rememberMe ? 7 : 1, // 7 days if checked, 1 day if not
          secure: window.location.protocol === 'https:',
          sameSite: 'Lax',
          path: '/'
        });

        // Set global state & navigate based on role
        if (role === 'admin') {
          setAdminUserData({ username });
          setAdminRole(role);
          setAdminToken(token);
          logUserActivity(username, 'Login', `This admin just logged in`);
          navigate('/admin/dashboard', { replace: true });
        } else if (role === 'user') {
          setUserUserData({ username });
          setUserRole(role);
          setUserToken(token);
          logUserActivity(username, 'Login', `This user just logged in`);
          navigate('/user/dashboard', { replace: true });
        } else if (role === 'guest') {
          setGuestUserData({ username });
          setGuestRole(role);
          setGuestToken(token);
          logUserActivity(username, 'Login', `This guest just logged in`);
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

  // Clears expired authentication cookies
  const checkAndClearExpiredCookies = () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      if (cookieName.startsWith('authToken_') && !allCookies[cookieName]) {
        // Remove specific auth data based on role
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
