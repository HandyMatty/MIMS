import axios from "axios";
import { message } from "antd";
import { useAdminAuthStore } from "../store/admin/useAuth";
import { useUserAuthStore } from "../store/user/useAuth";
import Cookies from 'js-cookie';

export const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


export const getUsersValues = {
  admin: "ADMIN",
  user: "USER",
};

export const getUserToken = (user = getUsersValues.user) => {
  if (user === getUsersValues.admin) {
    return useAdminAuthStore.getState();
  } else {
    return useUserAuthStore.getState();
  }
};

export const createAxiosInstanceWithInterceptor = (type = "data", user) => {
  const headers = {};

  if (type === "data") {
    headers["Content-Type"] = "application/json";
  } else if (type === "multipart") {
    headers["Content-Type"] = "multipart/form-data";
  }

  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers,
  });

  instance.interceptors.request.use(async (config) => {
    try {
      const { token } = getUserToken(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        throw new Error("Authorization token not found.");
      }
    } catch (error) {
      console.error({ error });
      return Promise.reject(error);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const { reset } = getUserToken(user);
      const errMessage = error.response?.data;
      if (errMessage?.message === "Invalid token." || errMessage?.code === 300) {
        message.warning("Unable to process transaction. You have to login again.");
        if (typeof reset === 'function') {
          reset();
        } else {
          console.warn('Reset function not available.');
        }
      }
      if (error.response && error.response.status === 401) {
        message.warning('You have been logged out because your account was accessed from another device.');
        localStorage.clear();
        sessionStorage.clear();
        Cookies.remove('authToken', { path: '/' });
        const allCookies = Cookies.get();
        Object.keys(allCookies).forEach((cookieName) => {
          if (cookieName.startsWith('authToken_')) {
            Cookies.remove(cookieName, { path: '/' });
          }
        });
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};