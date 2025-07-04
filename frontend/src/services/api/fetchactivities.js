import { axiosAuth } from "../axios"; 

export const fetchActivitiesApi = async () => {
  try {
    const response = await axiosAuth.get("/fetch_activities.php");
    return response.data;
  } catch (error) {
    console.error("Fetch Activities API Error:", error);
    throw error;
  }
};
