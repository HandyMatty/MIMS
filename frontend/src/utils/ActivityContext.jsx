import { createContext, useContext } from 'react';
import { logActivity } from '../services/api/logActivity';
import { useAdminAuthStore } from '../store/admin/useAuth';
import { useUserAuthStore } from '../store/user/useAuth';
import { useGuestAuthStore } from '../store/guest/useAuth';
import Cookies from 'js-cookie';

const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();
  const guestAuth = useGuestAuthStore();


  const logUserActivity = async (activity, details, overrideUsername) => {

  const username =
    overrideUsername ||
    adminAuth?.userData?.username ||
    userAuth?.userData?.username ||
    guestAuth?.userData?.username ||
    Cookies.get('username');

  
    if (!username) {
      console.error('No username found for logging activity');
      return;
    }
    try {
      await logActivity(username, activity, details);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return (
    <ActivityContext.Provider value={{ logUserActivity }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => useContext(ActivityContext);
