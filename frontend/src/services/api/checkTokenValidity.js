import { axiosAuth } from '../axios';

export const checkTokenValidity = async (token) => {
  try {
    const response = await axiosAuth.get('/profile.php', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || 
        error.message === 'Network Error' || 
        !navigator.onLine ||
        error.response?.status === 0) {
      return {
        success: true,
        offline: true,
        message: 'Offline mode - token validation skipped'
      };
    }
    
    throw error;
  }
}; 