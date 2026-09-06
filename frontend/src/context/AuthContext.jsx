/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";
const AuthContext = createContext(null);

// Global Axios request interceptor: automatically attaches Bearer token from localStorage
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("ge_token");
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Global Axios response interceptor: intercepts 401 on protected resources
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      const isPublic = url.includes("/auth/login") || url.includes("/auth/init-status") || url.includes("/auth/register-admin");
      if (!isPublic) {
        console.warn("[Auth] Protected endpoint returned 401 Unauthorized:", url);
        window.dispatchEvent(new CustomEvent("ge_auth_unauthorized", { detail: { url } }));
      }
    }
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("ge_token");
    const userData = localStorage.getItem("ge_user");
    if (token && userData) {
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        return JSON.parse(userData);
      } catch {
        localStorage.removeItem("ge_token");
        localStorage.removeItem("ge_user");
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for global 401 unauthorized events to sync logout
    const handleUnauthorized = () => {
      localStorage.removeItem("ge_token");
      localStorage.removeItem("ge_user");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    };
    window.addEventListener("ge_auth_unauthorized", handleUnauthorized);
    return () => window.removeEventListener("ge_auth_unauthorized", handleUnauthorized);
  }, []);

  const login = async (username, password, ethics) => {
    const res = await axios.post(`${API}/auth/login`, {
      username, password, ethics_accepted: ethics
    });
    const { token, ...userData } = res.data;
    localStorage.setItem("ge_token", token);
    localStorage.setItem("ge_user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
    } catch {
      // Ignore error during logout
    }
    localStorage.removeItem("ge_token");
    localStorage.removeItem("ge_user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const logActivity = async (module, action, target = "") => {
    try {
      await axios.post(`${API}/auth/log`, { module, action, target });
    } catch {
      // Ignore background log activity errors
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    const res = await axios.post(`${API}/auth/change-password`, {
      old_password: oldPassword,
      new_password: newPassword
    });
    if (res.data.status === "success") {
      const updatedUser = { ...user, must_change_password: false };
      localStorage.setItem("ge_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, logActivity, changePassword, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

