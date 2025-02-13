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
      // Remove expired cookies and clear localStorage
      checkAndClearExpiredCookies();

      const existingAdminAuth = JSON.parse(localStorage.getItem('adminAuth'));
      const existingUserAuth = JSON.parse(localStorage.getItem('userAuth'));
      const existingGuestAuth = JSON.parse(localStorage.getItem('guestAuth'));

      // If an admin is already logged in, prevent another user from logging in
      if (existingAdminAuth && existingAdminAuth.userData.username !== username) {
        return { success: false, message: 'A different admin is already logged in. Please log out first.' };
      }

      // If a user is already logged in, prevent another user from logging in
      if (existingUserAuth && existingUserAuth.userData.username !== username) {
        return { success: false, message: 'A different user is already logged in. Please log out first.' };
      }

      if (existingGuestAuth && existingGuestAuth.userData.username !== username) {
        return { success: false, message: 'A different guest is already logged in. Please log out first.' };
      }

      const response = await loginApi({ username, password });

      if (response.success) {
        const token = response.token;
        const role = response.role;
        const storage = rememberMe ? localStorage : sessionStorage;

        if (role === 'admin') {
          setAdminUserData({ username });
          setAdminRole(role);
          setAdminToken(token);
          logUserActivity(username, 'Login', `This admin just logged in`);

          storage.setItem('adminAuth', JSON.stringify({ userData: { username, role }, token }));

          Cookies.set(`authToken_${username}`, token, { expires: rememberMe ? 7 : 1, secure: false, sameSite: 'Strict' });
          navigate('/admin/dashboard', { replace: true });
        } 
        else if (role === 'user') {
          setUserUserData({ username });
          setUserRole(role);
          setUserToken(token);
          logUserActivity(username, 'Login', `This user just logged in`);

          storage.setItem('userAuth', JSON.stringify({ userData: { username, role }, token }));

          Cookies.set(`authToken_${username}`, token, { expires: rememberMe ? 7 : 1, secure: false, sameSite: 'Strict' });
          navigate('/user/dashboard', { replace: true });
        }
        else if (role === 'guest') {
          setGuestUserData({ username });
          setGuestRole(role);
          setGuestToken(token);
          logUserActivity(username, 'Login', `This guest just logged in`);

          storage.setItem('guestAuth', JSON.stringify({ userData: { username, role }, token }));
          Cookies.set(`authToken_${username}`, token, { expires: rememberMe ? 7 : 1, secure: false, sameSite: 'Strict' });
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
    for (const cookieName in allCookies) {
      // Check if the cookie has expired
      const cookieValue = Cookies.get(cookieName);
      if (!cookieValue) {
        if (cookieName.startsWith('authToken_')) {
          const username = cookieName.split('_')[1];
          localStorage.removeItem(`${username}Auth`);
          Cookies.remove(cookieName);
        }
      }
    }
  };

  return { mutate, isLoading, error };
};

export default useLoginAuth;
