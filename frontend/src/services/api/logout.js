import { axiosAuth } from "../axios";
import Cookies from "js-cookie";

export const logoutUser = async (role) => {
  try {
    let authData;
    if (role === "admin") authData = JSON.parse(localStorage.getItem("adminAuth"));
    if (role === "user") authData = JSON.parse(localStorage.getItem("userAuth"));
    if (role === "guest") authData = JSON.parse(localStorage.getItem("guestAuth"));

    if (!authData || !authData.state?.token) {
      throw new Error("No authentication token found");
    }

    const token = authData.state.token;
    const username = authData.state.username;
    const cookieName = `authToken_${username}`;

    // Clear auth data even if the request fails
    clearAuthData(role, username);

    const response = await axiosAuth.post(
      "/logout.php",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      return { success: true };
    } else {
      throw new Error(response.data.message || "Logout failed");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    return { success: false, message: error.message || "Logout error" };
  }
};

// ✅ **Clear Cookies, Local Storage, & Session Storage**
const clearAuthData = (role, username) => {
  sessionStorage.clear(); // Clear sessionStorage completely
  localStorage.clear(); // Clear localStorage completely
  Cookies.remove(`authToken_${username}`); // Remove cookie for the specific user
  Cookies.remove(`cookieExpiration_${username}`); // Remove expiration cookie for the specific user
  
  // Optionally remove all other cookies if needed:
  Cookies.remove("authToken"); // This removes the global authToken cookie
};
