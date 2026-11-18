import axios from "axios";

const envApiUrl = import.meta.env.VITE_APP_API_URL || "";

// In development, route through Vite proxy (/api/v1) if targeting a remote backend to avoid CORS issues
export const API_URL = (() => {
  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_DISABLE_PROXY !== "true" &&
    envApiUrl.startsWith("http") &&
    !envApiUrl.includes("localhost:5173")
  ) {
    try {
      const url = new URL(envApiUrl);
      return url.pathname.replace(/\/+$/, "") || "/api/v1";
    } catch {
      return "/api/v1";
    }
  }
  return envApiUrl;
})();

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  let userRole: string | null = null;

  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        userRole = payload.role;
      }
    } catch {
      // Ignore token decode errors
    }
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";
  const storedYear = localStorage.getItem("academicYear");

  // Admins can navigate past years; non-admins are locked to the active year (2569)
  const year = (isAdmin && storedYear) ? storedYear : (storedYear || "2569");
  config.headers["x-academic-year"] = year;

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and not already retrying (skip /auth/login and /auth/me to avoid loops)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/me')
    ) {
      originalRequest._retry = true;

      try {
        // Refresh token is sent automatically via HttpOnly cookie
        const response = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });

        if (response.data && response.data.access_token) {
          const newToken = response.data.access_token;
          localStorage.setItem("access_token", newToken);

          // Update the original request's Authorization header
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          // Retry the original request with the new token
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh fails, clear token and redirect to login
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