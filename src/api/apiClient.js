import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

let logoutHandler = () => {};

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

const apiClient = axios.create({
  baseURL: "http://10.10.102.131:8080/api",
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logoutHandler();
    }
    return Promise.reject(error);
  }
);

export const getMenuItems = () => {
  return apiClient.get("/menu-items/me");
};

export const deleteMenuItem = (id) => {
  return apiClient.delete(`/menu-items/${id}`);
};

export const updateMenuItem = (id, data) => {
  return apiClient.put(`/menu-items/${id}`, data);
};

export const uploadImage = (formData) => {
  return apiClient.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadBase64Image = (base64String) => {
  return apiClient.post("/upload", { file: base64String });
};

export const getSellerProfile = (id) => {
  return apiClient.get(`/sellers/${id}`);
};

export const updateSellerProfile = (id, data) => {
  return apiClient.put(`/sellers/${id}`, data);
};

export default apiClient;
