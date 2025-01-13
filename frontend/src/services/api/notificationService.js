import { axiosAuth } from "../axios";  // Import axios instance for authentication

// Function to get notifications for the user
export const getNotifications = async (username) => {
  try {
    const response = await axiosAuth.post('/getNotifications.php', {
      username,
    });

    if (response.data.success) {
      return { success: true, notifications: response.data.notifications };  // Assuming the API returns an array of notifications
    } else {
      console.error('Failed to fetch notifications:', response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, message: 'Error fetching notifications' };
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const response = await axiosAuth.post('/markNotificationAsRead.php', { id });
    if (response.data.success) {
      console.log('Notification marked as read:', response.data.message);
      return { success: true };
    } else {
      console.error('Failed to mark notification as read:', response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, message: 'Error marking notification as read' };
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await axiosAuth.post('/deleteNotification.php', { id });
    if (response.data.success) {
      console.log('Notification deleted:', response.data.message);
      return { success: true };
    } else {
      console.error('Failed to delete notification:', response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, message: 'Error deleting notification' };
  }
};

export const markAllNotificationsAsRead = async (username) => {
  try {
    const response = await axiosAuth.post('/markAllNotificationsAsRead.php', { username });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, message: 'Error marking all notifications as read' };
  }
};

export const clearAllNotifications = async (username) => {
  try {
    const response = await axiosAuth.post('/clearAllNotifications.php', { username });
    return response.data;
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    return { success: false, message: 'Error clearing notifications' };
  }
};
