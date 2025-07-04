import { axiosAuth } from "../axios"; 

export const updatePassword = async (token, passwordData) => {
    try {
      const response = await axiosAuth.put("/changePassword.php", passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Password update API Error:', error);
      throw error;
    }
};
