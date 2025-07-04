import { axiosAuth } from '../axios';

export const batchDeleteItems = async (itemIds) => {
  try {
    const response = await axiosAuth.post('/batch_delete_items.php', { itemIds });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default batchDeleteItems; 