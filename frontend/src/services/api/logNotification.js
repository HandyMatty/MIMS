import { axiosAuth } from "../axios";  

export const logNotification = async (username, message, details) => {
  try {
    const response = await axiosAuth.post('/logNotification.php', {
      username,
      message,
      details,
    });

    if (response.data.success) {
      console.log('Notification logged successfully:', response.data.message);
      return response.data;
    } else {
      console.error('Failed to log notification:', response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error('Error logging notification:', error);
    return { success: false, message: 'Error logging notification' };
  }
};
