import axios from "axios";
import { getCookie, setCookie, removeCookie } from "../utils/cookie.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

const AUTH_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/refresh-token",
  "/auth/logout",
];

const clearSession = () => {
  removeCookie("token");
  removeCookie("refreshToken");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("sport_user");
  localStorage.removeItem("isLogin");
};

let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = getCookie("refreshToken") || localStorage.getItem("refreshToken");
    if (!refreshToken) return Promise.reject(new Error("Không có refresh token"));

    refreshPromise = axios
      .post(`${API_URL}/auth/refresh-token`, { refreshToken })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        if (!data?.accessToken) throw new Error("Phản hồi refresh token không hợp lệ");
        setCookie("token", data.accessToken, 1);
        if (data.refreshToken) setCookie("refreshToken", data.refreshToken, 7);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        if (data.user) localStorage.setItem("sport_user", JSON.stringify(data.user));
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function buildError(error) {
  const status = error.response?.status;
  const body = error.response?.data;

  let message = body?.message;
  if (!message) {
    if (error.code === "ECONNABORTED") message = "Máy chủ phản hồi quá lâu, vui lòng thử lại sau!";
    else if (!error.response) message = "Không kết nối được máy chủ, vui lòng thử lại sau!";
    else message = error.message;
  }

  const fieldErrors = body?.errors;
  if (fieldErrors && typeof fieldErrors === "object") {
    const first = Object.values(fieldErrors)[0];
    if (first) message = `${message}: ${first}`;
  }

  const err = new Error(message);
  err.status = status;
  err.response = error.response;
  err.errors = fieldErrors;
  return err;
}

axiosClient.interceptors.request.use(
  (config) => {
    const token = getCookie("token") || localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body) {
      if (body.success === false) {
        return Promise.reject(new Error(body.message || "Có lỗi xảy ra"));
      }
      return body.data;
    }
    return body;
  },
  (error) => {
    const status = error.response?.status;
    const original = error.config || {};
    const url = original.url || "";
    const isAuthUrl = AUTH_URLS.some((u) => url.includes(u));

    if (status === 401 && !isAuthUrl && !original._retry) {
      original._retry = true;
      return refreshAccessToken().then(
        (newToken) => {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(original);
        },
        () => {
          clearSession();
          if (window.location.pathname !== "/login") window.location.href = "/login";
          return Promise.reject(buildError(error));
        },
      );
    }

    return Promise.reject(buildError(error));
  },
);

export default axiosClient;
