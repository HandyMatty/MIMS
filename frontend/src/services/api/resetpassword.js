import { axiosAuth } from "../axios";

export const resetPasswordApi = async (userId, newPassword) => {
  try {
    const payload = { userId, password: newPassword };
    const response = await axiosAuth.post("/reset_password.php", payload);
    return response.data;
  } catch (error) {
    console.error('Reset Password API Error:', error);
    throw error;
  }
};
