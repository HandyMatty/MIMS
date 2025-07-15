import axios from "axios";
import { message } from "antd";
import { useAdminAuthStore } from "../store/admin/useAuth";
import { useUserAuthStore } from "../store/user/useAuth";
import Cookies from 'js-cookie';


const getApiBaseUrl = () => import.meta.env.VITE_API_BASE_URL;

const isLocalhost = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || 
         hostname === '127.0.0.1' || 
         hostname === '' ||
         hostname.startsWith('192.168.') ||
         process.env.NODE_ENV === 'development';
};

const checkLocalBackend = async () => {
  try {
    const response = await fetch('/api/inventory.php', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.log('Local backend check failed:', error.message);
    return false;
  }
};

const isOffline = async () => {
  if (isLocalhost()) {
    return !(await checkLocalBackend());
  }
  
  return !navigator.onLine || 
         navigator.connection?.effectiveType === 'none' ||
         navigator.connection?.downlink === 0;
};

const createOfflineRejection = (error) => {
  const offlineError = new Error('Network request cancelled - offline');
  offlineError.isOffline = true;
  offlineError.originalError = error;
  return Promise.reject(offlineError);
};

export const axiosAuth = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

axiosAuth.interceptors.request.use(
  async (config) => {
    if (await isOffline()) {
      return createOfflineRejection(new Error('Offline - request cancelled'));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ERR_NETWORK' || 
        error.message === 'Network Error' || 
        error.message.includes('ERR_INTERNET_DISCONNECTED') ||
        error.message.includes('Failed to fetch') ||
        await isOffline() ||
        error.response?.status === 0) {
      return createOfflineRejection(error);
    }
    
    return Promise.reject(error);
  }
);


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
    baseURL: getApiBaseUrl(),
    headers,
  });

  instance.interceptors.request.use(async (config) => {
    try {
      if (await isOffline()) {
        return createOfflineRejection(new Error('Offline - request cancelled'));
      }

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
    async (error) => {
      if (error.code === 'ERR_NETWORK' || 
          error.message === 'Network Error' || 
          error.message.includes('ERR_INTERNET_DISCONNECTED') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('Offline - request cancelled') ||
          await isOffline() ||
          error.response?.status === 0) {
        return createOfflineRejection(error);
      }

      const { reset } = getUserToken(user);
      const errMessage = error.response?.data;
      if (errMessage?.message === "Token expired") {
        message.warning("Your session has expired. Please log in again.");
        if (typeof reset === 'function') reset();
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
      } else if (errMessage?.message === "Logged in from another device") {
        message.warning("You have been logged out because your account was accessed from another device.");
        if (typeof reset === 'function') reset();
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
      } else if (errMessage?.message === "Invalid token." || errMessage?.code === 300) {
        message.warning("Unable to process transaction. You have to login again.");
        if (typeof reset === 'function') {
          reset();
        } else {
          console.warn('Reset function not available.');
        }
      }
      if (error.response && error.response.status === 401) {
        message.warning('You have been logged out because your session expired or your account was accessed from another device.');
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