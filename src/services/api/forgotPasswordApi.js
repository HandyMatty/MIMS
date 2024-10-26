import { axiosAuth } from "../axios";

export const forgotPasswordApi = async (payload) => {
  try {
    const response = await axiosAuth.post("/forgot_password.php", payload);
    return response.data;
  } catch (error) {
    console.error('Forgot Password API Error:', error);
    throw error; // Propagate the error to the caller
  }
};
