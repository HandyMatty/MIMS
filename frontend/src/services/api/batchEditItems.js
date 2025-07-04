import { axiosAuth } from '../axios';

export const batchEditItems = async (items) => {
  try {
    const response = await axiosAuth.post('/batch_edit_items.php', { items });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default batchEditItems; 