import { axiosAuth } from "../axios"; 

// Fetch user profile data
export const fetchProfileData = async (token) => {
  try {
    const response = await axiosAuth.get("/profile.php", { // Adjust the endpoint as needed
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Adjust based on your API response structure
  } catch (error) {
    console.error('Fetch profile API Error:', error);
    throw error;
  }
};

// Update user profile data
export const updateProfileData = async (token, data) => {
  try {
    const response = await axiosAuth.put("/updateProfile.php", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Adjust based on your API response structure
  } catch (error) {
    console.error('Profile update API Error:', error);
    throw error;
  }
};



