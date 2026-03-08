import axios from "axios";

export const API_URL = `${import.meta.env.VITE_APP_API_URL}`;

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const year = localStorage.getItem("academicYear");
  if (year) {
    config.headers["x-academic-year"] = year;
  }

  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  const refreshToken = localStorage.getItem("refresh_token");
  if (refreshToken) {
    config.headers["x-refresh-token"] = refreshToken;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          // Attempt to refresh token by calling /auth/me
          // The request interceptor will automatically include the x-refresh-token
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              'x-refresh-token': refreshToken
            }
          });

          if (response.data && response.data.access_token) {
            const newToken = response.data.access_token;
            localStorage.setItem("access_token", newToken);
            
            // Update the original request's Authorization header
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            
            // Retry the original request with the new token
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        if (!window.location.pathname.includes('/login')) {
          window.location.href = "/login";
        }
      }
    }

    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });

    return Promise.reject(error);
  }
);

export * from "./api/auth";
export * from "./api/orders";
export * from "./api/products";
export * from "./api/data";
export * from "./api/teams";
export * from "./api/settings";
export * from "./api/orderBooks";