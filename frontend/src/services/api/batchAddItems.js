import { axiosAuth } from "../axios";

export const batchAddItems = async (items) => {
  try {
    const response = await axiosAuth.post('/batch_add_items.php', { items });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default batchAddItems; 