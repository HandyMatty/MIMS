import { axiosAuth } from "../axios";
import Cookies from "js-cookie";
import { useAdminAuthStore } from "../../store/admin/useAuth";
import { useUserAuthStore } from "../../store/user/useAuth";
import { useGuestAuthStore } from "../../store/guest/useAuth";

export const logoutUser = async (role) => {
  try {
    let authData;
    if (role === "admin") authData = JSON.parse(localStorage.getItem("adminAuth"));
    if (role === "user") authData = JSON.parse(localStorage.getItem("userAuth"));
    if (role === "guest") authData = JSON.parse(localStorage.getItem("guestAuth"));

    if (!authData || !authData.state?.token) {
      clearAuthData(role, authData?.state?.username);
      return { success: false, message: "No authentication token found" };
    }

    const token = authData.state.token;

    // Send logout request to the server
    await axiosAuth.post("/logout.php", {}, { headers: { Authorization: `Bearer ${token}` } });

    // Clear stored data regardless of response
    clearAuthData(role, authData.state.username);

    return { success: true };
  } catch (error) {
    console.error("Error during logout:", error);
    return { success: false, message: "Logout error" };
  }
};


// ✅ Clear all storage and cookies
const clearAuthData = (role, username) => {
  sessionStorage.clear(); // Clear sessionStorage completely
  localStorage.clear();   // Clear localStorage completely

  if (username) {
    Cookies.remove(`authToken_${username}`); // Remove user-specific cookie
    Cookies.remove(`cookieExpiration_${username}`); // Remove expiration cookie if used
  }
  Cookies.remove("authToken"); // Remove global auth token cookie

  // Reset Zustand stores
  if (role === "admin") useAdminAuthStore.getState().reset();
  if (role === "user") useUserAuthStore.getState().reset();
  if (role === "guest") useGuestAuthStore.getState().reset();
};
