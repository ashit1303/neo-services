import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:4020",
  baseURL: "https://testing-be.dev.argus.obenelectric.com",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  const userId = localStorage.getitem("userId");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (userId) {
    config.headers.userId = userId;
  }

  return config;
});

export default api;
