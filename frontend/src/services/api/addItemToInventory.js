import { axiosAuth } from "../axios"; // Assuming axios is properly set up

export const addItemToInventory = async (itemData) => {
  try {
      const response = await axiosAuth.post("/add_item.php", itemData, {
          headers: { "Content-Type": "application/json" },
      });
      return response.data; 
  } catch (error) {
      console.error("Add item API Error:", error);
      throw error;
  }
};


  export const getInventoryData = async () => {
    try {
        const response = await axiosAuth.get('/getInventoryData.php');
        return Array.isArray(response.data) ? response.data : []; // Ensure an array is returned
    } catch (error) {
        console.error('Failed to fetch inventory data:', error.message);
        throw error;
    }
};


export const deleteItems = async (ids) => {
  try {
    const response = await axiosAuth.post('/delete_item.php', { ids });
    return response.data;
  } catch (error) {
    console.error("Delete item API Error:", error);
    throw error;
  }
};

export const updateItem = async (itemData) => {
  try {
    const response = await axiosAuth.post("/update_item.php", itemData);
    return response.data; // Return the success message or item data
  } catch (error) {
    console.error("Update item API Error:", error);
    throw error;
  }
};

export const redistributeItem = async (itemData) => {
  try {
    const response = await axiosAuth.post("/redistribute_item.php", itemData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Redistribute item API Error:", error);
    throw error;
  }
};
