import { axiosAuth } from "../axios"; 


export const getInventoryCounts = async () => {
    try {
      const response = await axiosAuth.get("/inventory.php");
      return response.data; 
    } catch (error) {
      console.error('Failed to fetch inventory counts:', error.message);
      throw error;
    }
  };