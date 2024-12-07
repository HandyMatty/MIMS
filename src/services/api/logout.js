import { axiosAuth } from "../axios"; // Adjust the path as per your folder structure

export const logoutUser = async () => {
  try {
    // Retrieve the token from sessionStorage
    const adminAuth = JSON.parse(sessionStorage.getItem("adminAuth"));
    const userAuth = JSON.parse(sessionStorage.getItem("userAuth"));
    const token = adminAuth?.state?.token || userAuth?.state?.token;

    if (!token) {
      // If no token is found, throw an error
      throw new Error("No authentication token found");
    }

    // Call the logout API with the token in the Authorization header
    const response = await axiosAuth.post(
      "/logout.php",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      // Broadcast logout event to all tabs
      localStorage.setItem("logout", Date.now()); // Add timestamp to trigger change
      return { success: true };
    } else {
      // If the API response is not successful, throw an error
      throw new Error(response.data.message || "Logout failed");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    return { success: false, message: error.message || "Logout error" };
  }
};
