import { axiosAuth } from "../axios";

export const loginApi = async (payload) => {
  try {
    const response = await axiosAuth.post("/login.php", payload);
    return response.data;
  } catch (error) {
    console.error('Login API Error:', error);
    throw error;
  }
};
