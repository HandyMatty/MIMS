import { axiosAuth } from "../axios";

export const getHistory = async () => {
  try {
    const response = await axiosAuth.get('/getHistory.php');
    return response.data;
} catch (error) {
  console.error("Error fetching history:", error);
  throw error;
}
};
