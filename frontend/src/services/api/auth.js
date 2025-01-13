import { axiosAuth } from "../axios";

export const loginApi = async (payload) => {
  try {
    const response = await axiosAuth.post("/login.php", payload); // Use relative path since baseURL is set in axiosAuth
    return response.data;
  } catch (error) {
    console.error('Login API Error:', error);
    throw error; // Propagate the error to the caller
  }
};
