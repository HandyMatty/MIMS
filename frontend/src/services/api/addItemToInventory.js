import { axiosAuth } from "../axios";
import { isOffline, createOfflineError } from "../../utils/offlineUtils";

export const addItemToInventory = async (itemData) => {
  try {
    if (await isOffline()) {
      throw createOfflineError(new Error('Offline - cannot add item'));
    }

    const response = await axiosAuth.post("/add_item.php", itemData, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data; 
  } catch (error) {
    if (error.isOffline) {
      console.log('Add item cancelled - offline');
      throw error;
    }
    console.error("Add item API Error:", error);
    throw error;
  }
};

export const getInventoryData = async () => {
  try {
    if (await isOffline()) {
      throw createOfflineError(new Error('Offline - cannot fetch inventory'));
    }

    const response = await axiosAuth.get('/getInventoryData.php');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error.isOffline) {
      console.log('Get inventory cancelled - offline');
      throw error;
    }
    console.error('Failed to fetch inventory data:', error.message);
    throw error;
  }
};

export const deleteItems = async (ids) => {
  try {
    if (await isOffline()) {
      throw createOfflineError(new Error('Offline - cannot delete items'));
    }

    const response = await axiosAuth.post("/delete_item.php", { ids });
    return response.data;
  } catch (error) {
    if (error.isOffline) {
      console.log('Delete items cancelled - offline');
      throw error;
    }
    console.error("Delete items API Error:", error);
    throw error;
  }
};

export const updateItem = async (itemData) => {
  try {
    if (await isOffline()) {
      throw createOfflineError(new Error('Offline - cannot update item'));
    }

    console.log("Sending update data:", itemData);
    const response = await axiosAuth.post("/update_item.php", itemData);
    return response.data;
  } catch (error) {
    if (error.isOffline) {
      console.log('Update item cancelled - offline');
      throw error;
    }
    console.error("Update item API Error:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw error;
  }
};

export const redistributeItem = async (itemData) => {
  try {
    if (await isOffline()) {
      throw createOfflineError(new Error('Offline - cannot redistribute item'));
    }

    const response = await axiosAuth.post("/redistribute_item.php", itemData);
    return response.data;
  } catch (error) {
    if (error.isOffline) {
      console.log('Redistribute item cancelled - offline');
      throw error;
    }
    console.error("Redistribute item API Error:", error);
    throw error;
  }
};
