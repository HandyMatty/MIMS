import { createContext, useContext, useState, useEffect } from 'react';
import { logNotification } from '../services/api/logNotification';  // Import the logNotification function
import { getNotifications, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead, clearAllNotifications } from '../services/api/notificationService';
import { useAdminAuthStore } from '../store/admin/useAuth';  // Admin auth store
import { useUserAuthStore } from '../store/user/useAuth';  // User auth store
import Cookies from 'js-cookie';

// Create a context for notifications
const NotificationContext = createContext();
   
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();

  const isAdmin = !!(adminAuth.token && adminAuth.userData);
  const isUser = !!(userAuth.token && userAuth.userData);

  // Get username from the store or fallback to cookies
  const username = isAdmin ? adminAuth?.userData?.username : isUser ? userAuth?.userData?.username : Cookies.get('username');

  useEffect(() => {
    if (username) {
      // Fetch notifications when the component mounts or the username changes
      getNotifications(username)
        .then((response) => {
          if (response.success) {
            setNotifications(response.notifications);
          } else {
            console.error('Failed to fetch notifications:', response.message);
          }
        })
        .catch((error) => {
          console.error('Error fetching notifications:', error);
        });
    }
  }, [username]);

  const markAsRead = async (id) => {
    const response = await markNotificationAsRead(id); // Pass the id to the backend
    if (response.success) {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      return true;
    } else {
      console.error('Error marking notification as read:', response.message);
      return false;
    }
  };
  

  // Function to log a notification and also store it in the state
  const logUserNotification = async (message, details) => {
    try {
      // Log the notification via the API function, passing the current username
      const response = await logNotification(username, message, details);
  
      if (response.success) {
        setNotifications((prevNotifications) => [
          { username, message, details, notification_date: new Date().toISOString() },
          ...prevNotifications,
        ].sort((a, b) => b.createdAt - a.createdAt));       
      } else {
        console.error('Failed to log notification:', response.message);
      }
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  };
  

  const deleteNotif = async (id) => {
    const response = await deleteNotification(id);
    if (response.success) {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      );
      return true;
    } else {
      console.error('Error deleting notification:', response.message);
      return false;
    }
  };

  const markAllasread = async () => {
    try {
      const response = await markAllNotificationsAsRead(username);
      if (response.success) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({ ...notification, read: true }))
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  const clearall = async () => {
    try {
      const response = await clearAllNotifications(username);
      if (response.success) {
        setNotifications([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  };


  return (
    <NotificationContext.Provider value={{ notifications, logUserNotification, markAsRead, deleteNotif, markAllasread, clearall, }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);