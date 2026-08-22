/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";
const AuthContext = createContext(null);

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
  const [loading] = useState(false);

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

  return (
    <AuthContext.Provider value={{ user, login, logout, logActivity, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

