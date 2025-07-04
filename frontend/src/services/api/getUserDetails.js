import { axiosAuth } from "../axios"; 

export const fetchProfileData = async (token) => {
  try {
    const response = await axiosAuth.get("/profile.php", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch profile API Error:', error);
    throw error;
  }
};


export const updateProfileData = async (token, data) => {
  try {
    const response = await axiosAuth.put("/updateProfile.php", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Profile update API Error:', error);
    throw error;
  }
};



