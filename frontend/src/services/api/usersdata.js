import { axiosAuth } from "../axios"; // Assuming axios is properly set up

export const fetchUsersData = async () => {
  try {
    const response = await axiosAuth.get("/users.php"); 
    return response.data; 
  } catch (error) {
    console.error("Fetch users data API Error:", error);
    throw error;
  }
};

export const addUser = async (userData) => {
  try {
    const response = await axiosAuth.post("/users_add.php", userData);
    return response.data;
  } catch (error) {
    console.error("Add user API Error:", error);
    throw error;
  }
};

export const deleteUsers = async (userIds) => {
  try {
    const response = await axiosAuth.post("/users_delete.php", { userIds });
    return response.data;
  } catch (error) {
    console.error("Delete users API Error:", error);
    throw error;
  }
};

export const fetchUsersStatistics = async () => {
  try {
    const response = await axiosAuth.get("/getUsersStatistics.php"); 
    return response.data; 
  } catch (error) {
    console.error("Error fetching users statistics:", error);
    throw error;
  }
};

export const getSecurityQuestion = async (userId) => {
  try {
    const response = await axiosAuth.get(`/updateSecurityQuestion.php?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching security question:", error);
    return { success: false };
  }
};

export const updateSecurityQuestion = async (userId, securityQuestion, securityAnswer) => {
  try {
    const response = await axiosAuth.post("/updateSecurityQuestion.php", {
      userId,
      security_question: securityQuestion,
      security_answer: securityAnswer,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating security question:", error);
    return { success: false };
  }
};

export const updateRole = async (userId, role) => {
  try {
    const response = await axiosAuth.post("/update_role.php", {
      userId,  // Ensure userId is being sent, not just username
      role
    });
    return response.data;
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
};

export const updateDepartment = async (userId, department) => {
  try {
    console.log('Sending update request:', { userId, department });
    const response = await axiosAuth.post("/update_department.php", 
      { userId, department },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false
      }
    );
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Update department API Error:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    } else if (error.request) {
      console.error("Error request:", error.request);
    }
    throw error;
  }
};






