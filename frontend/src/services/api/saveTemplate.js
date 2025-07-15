import { createAxiosInstanceWithInterceptor, getUsersValues } from "../axios";
import { useAdminAuthStore } from "../../store/admin/useAuth";
import { useUserAuthStore } from "../../store/user/useAuth";

const getAuthenticatedAxios = () => {
  const adminAuth = useAdminAuthStore.getState();
  const userAuth = useUserAuthStore.getState();
  
  if (adminAuth.token && adminAuth.userData) {
    return createAxiosInstanceWithInterceptor("data", getUsersValues.admin);
  } else if (userAuth.token && userAuth.userData) {
    return createAxiosInstanceWithInterceptor("data", getUsersValues.user);
  } else {
    throw new Error("No valid authentication found");
  }
};

export const saveTemplate = async (template) => {
  try {
    const axiosInstance = getAuthenticatedAxios();
    const response = await axiosInstance.post('/save_template.php', template);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTemplates = async () => {
  try {
    const axiosInstance = getAuthenticatedAxios();
    const response = await axiosInstance.get('/get_templates.php');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTemplate = async (id, template) => {
  try {
    const axiosInstance = getAuthenticatedAxios();
    const response = await axiosInstance.put(`/update_template.php?id=${id}`, template);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTemplate = async (id) => {
  try {
    const axiosInstance = getAuthenticatedAxios();
    const response = await axiosInstance.delete(`/delete_template.php?id=${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 