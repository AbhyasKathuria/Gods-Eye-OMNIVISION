import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ge_token");
    const userData = localStorage.getItem("ge_user");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch {
        localStorage.removeItem("ge_token");
        localStorage.removeItem("ge_user");
      }
    }
    setLoading(false);
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
    } catch {}
    localStorage.removeItem("ge_token");
    localStorage.removeItem("ge_user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const logActivity = async (module, action, target = "") => {
    try {
      await axios.post(`${API}/auth/log`, { module, action, target });
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, logActivity, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
