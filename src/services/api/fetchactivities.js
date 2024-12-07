import { axiosAuth } from "../axios"; 

/**
 * Fetch user activities.
 * @returns {Promise<Array>} Array of user activities.
 */
export const fetchActivitiesApi = async () => {
  try {
    const response = await axiosAuth.get("/fetch_activities.php");
    return response.data;
  } catch (error) {
    console.error("Fetch Activities API Error:", error);
    throw error; // Propagate the error to the caller
  }
};
