import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Download API is public, so don't send JWT
    if (
      token &&
      !config.url.startsWith("/files/download/")
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;