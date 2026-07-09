import axios from "axios";

const api = axios.create({
  baseURL: "https://fortlio-be.duckdns.org",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (
    config.url !== "/auth/login" &&
    config.url !== "/auth/register"
  ) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;