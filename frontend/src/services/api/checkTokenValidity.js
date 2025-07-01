import { axiosAuth } from '../axios';

export const checkTokenValidity = async (token) => {
  try {
    const response = await axiosAuth.get('/profile.php', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 