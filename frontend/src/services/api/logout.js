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

    await axiosAuth.post("/logout.php", {}, { headers: { Authorization: `Bearer ${token}` } });

    clearAuthData(role, authData.state.username);

    return { success: true };
  } catch (error) {
    console.error("Error during logout:", error);
    return { success: false, message: "Logout error" };
  }
};


const clearAuthData = (role, username) => {
  sessionStorage.clear(); 
  localStorage.clear();  

  if (username) {
    Cookies.remove(`authToken_${username}`, { path: '/' }); 
  }
  Cookies.remove("authToken", { path: '/' }); 

  if (role === "admin") useAdminAuthStore.getState().reset();
  if (role === "user") useUserAuthStore.getState().reset();
  if (role === "guest") useGuestAuthStore.getState().reset();
};
