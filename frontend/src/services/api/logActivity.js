import { axiosAuth } from "../axios";

export const logActivity = async (username, activity, details) => {
  try {
    const response = await axiosAuth.post('/logActivity.php', {
      username,
      activity,
      details,
    });

    if (response.data.success) {
      console.log('Activity logged successfully:', response.data.message);
    } else {
      console.error('Failed to log activity:', response.data.message);
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
