import { axiosAuth } from "../axios"; // Assuming axios is set up correctly

export const getHistory = async () => {
  try {
    const response = await axiosAuth.get('/getHistory.php'); // Fetch history from PHP endpoint
    return response.data;
} catch (error) {
  console.error("Error fetching history:", error);
  throw error;
}
};
