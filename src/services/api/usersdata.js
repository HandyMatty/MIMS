import { axiosAuth } from "../axios"; // Assuming axios is properly set up

// Fetch users data without token
export const fetchUsersData = async () => {
  try {
    const response = await axiosAuth.get("/users.php"); // Adjust the endpoint as needed
    return response.data; // Assuming the response contains the users in 'users' key
  } catch (error) {
    console.error("Fetch users data API Error:", error);
    throw error;
  }
};

// Add a new user
export const addUser = async (userData) => {
  try {
    const response = await axiosAuth.post("/users_add.php", userData);
    return response.data;
  } catch (error) {
    console.error("Add user API Error:", error);
    throw error;
  }
};

// Delete selected users
export const deleteUsers = async (userIds) => {
  try {
    const response = await axiosAuth.post("/users_delete.php", { userIds });
    return response.data;
  } catch (error) {
    console.error("Delete users API Error:", error);
    throw error;
  }
};

// Fetch user statistics
export const fetchUsersStatistics = async () => {
  try {
    const response = await axiosAuth.get("/getUsersStatistics.php"); 
    return response.data; 
  } catch (error) {
    console.error("Error fetching users statistics:", error);
    throw error;
  }
};

// Fetch security question
export const getSecurityQuestion = async (userId) => {
  try {
    const response = await axiosAuth.get(`/updateSecurityQuestion.php?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching security question:", error);
    return { success: false };
  }
};

// Update security question and answer
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






