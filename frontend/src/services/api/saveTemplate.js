import { axiosAuth } from "../axios";

export const saveTemplate = async (template) => {
  try {
    const response = await axiosAuth.post('/save_template.php', template);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTemplates = async () => {
  try {
    const response = await axiosAuth.get('/get_templates.php');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTemplate = async (id, template) => {
  try {
    const response = await axiosAuth.put(`/update_template.php?id=${id}`, template);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTemplate = async (id) => {
  try {
    const response = await axiosAuth.delete(`/delete_template.php?id=${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 