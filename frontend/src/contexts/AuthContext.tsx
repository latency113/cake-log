import React, { createContext, useContext, useState, useCallback } from 'react';
import { api, loginUser as apiLoginUser, me as apiMe } from '../utils/api';
import type { LoginResponse } from '../utils/api/auth';
import type { User, Role } from "../types";


interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("access_token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refresh_token"));

  // Update axios instance when tokens change
  React.useEffect(() => {
    if (accessToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      localStorage.setItem("access_token", accessToken);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem("access_token");
    }
    
    if (refreshToken) {
      api.defaults.headers.common['x-refresh-token'] = refreshToken;
      localStorage.setItem("refresh_token", refreshToken);
    } else {
      delete api.defaults.headers.common['x-refresh-token'];
      localStorage.removeItem("refresh_token");
    }
  }, [accessToken, refreshToken]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiLoginUser(username, password);
    setUser({ ...response.user, role: response.user.role as Role });
    setAccessToken(response.access_token);
    setRefreshToken(response.refresh_token);

    if (response.access_token) {
      localStorage.setItem("access_token", response.access_token);
    }
    if (response.refresh_token) {
      localStorage.setItem("refresh_token", response.refresh_token);
    }
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (refreshToken) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
  }, [refreshToken]);

  const checkAuth = useCallback(async () => {
    try {
      const storedAccessToken = localStorage.getItem("access_token");
      const storedRefreshToken = localStorage.getItem("refresh_token");

      if (storedAccessToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;
        setAccessToken(storedAccessToken);
      }
      if (storedRefreshToken) {
        api.defaults.headers.common['x-refresh-token'] = storedRefreshToken;
        setRefreshToken(storedRefreshToken);
      }

      if (!storedAccessToken && !storedRefreshToken) {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        return; // No tokens, so no need to check /auth/me
      }

      const userData = await apiMe();
      // Add a check to ensure user data is valid before setting state
      if (userData && userData.id) { // Check for required user properties, e.g., 'id'
        if (userData.access_token) {
          setAccessToken(userData.access_token);
          localStorage.setItem("access_token", userData.access_token);
        }
        // Ensure role is cast correctly
        setUser({ ...userData, role: userData.role as Role });
      } else {
        // If user data is invalid or missing, clear auth state
        console.warn("Invalid user data received from /auth/me, clearing auth state.");
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // Optionally navigate to login page if checkAuth fails
      // window.location.href = "/login"; 
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};