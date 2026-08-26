import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";
import { useContext, useState } from "react";
import Navbar from "./components/dashboard/Navbar";
import Sidebar from "./components/dashboard/Sidebar";
import Dashboard from "./pages/Dashboard";
import IdentityEngine from "./pages/IdentityEngine";
import CyberIntel from "./pages/CyberIntel";
import GeoTracker from "./pages/GeoTracker";
import NewsMonitor from "./pages/NewsMonitor";
import AIBrain from "./pages/AIBrain";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import VisualIntel from "./pages/VisualIntel";
import UsernameRecon from "./pages/UsernameRecon";
import APIHealth from "./pages/APIHealth";
import ThreatScore from "./pages/ThreatScore";
import IntelGraph from "./pages/IntelGraph";
import Playbooks from "./pages/Playbooks";
import WirelessRecon from "./pages/WirelessRecon";
import CryptoTracker from "./pages/CryptoTracker";

function PasswordResetRequired() {
  const { user, changePassword, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.status === "success") {
        // Updated state handles closing
      } else {
        setError(res.message || "Failed to update password.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      height: "100vh", width: "100vw", background: "#000000",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Courier New", position: "relative", overflow: "hidden",
      zIndex: 9999
    }}>
      <div style={{
        width: "420px", background: "#060000",
        border: "1px solid #ff0000", borderTop: "3px solid #ff0000",
        padding: "32px", position: "relative"
      }}>
        <div style={{ fontSize: "20px", fontWeight: "bold", color: "#ff0000", letterSpacing: "4px", marginBottom: "8px", textAlign: "center" }}>
          SECURITY PROTOCOL
        </div>
        <div style={{ fontSize: "10px", color: "#882222", letterSpacing: "2px", marginBottom: "20px", textAlign: "center" }}>
          INITIAL PASSWORD DETECTED. YOU MUST UPDATE YOUR CREDENTIALS.
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "10px", color: "#ff4400", letterSpacing: "2px", display: "block", marginBottom: "6px" }}>CURRENT PASSWORD</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", background: "#000000",
                border: "1px solid #ff0000", color: "#ff2222", fontFamily: "Courier New"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "10px", color: "#ff4400", letterSpacing: "2px", display: "block", marginBottom: "6px" }}>NEW PASSWORD</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", background: "#000000",
                border: "1px solid #ff0000", color: "#ff2222", fontFamily: "Courier New"
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "10px", color: "#ff4400", letterSpacing: "2px", display: "block", marginBottom: "6px" }}>CONFIRM NEW PASSWORD</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", background: "#000000",
                border: "1px solid #ff0000", color: "#ff2222", fontFamily: "Courier New"
              }}
            />
          </div>

          {error && (
            <div style={{ color: "#ff0000", fontSize: "11px", marginTop: "8px", border: "1px solid #ff0000", padding: "8px", background: "#1a0000" }}>
              ERROR: {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", marginTop: "12px", background: "#1a0000",
              border: "1px solid #ff0000", color: "#ff0000", fontFamily: "Courier New",
              cursor: "pointer", letterSpacing: "2px"
            }}
          >
            {loading ? "SAVING..." : "UPDATE CREDENTIALS"}
          </button>
        </form>

        <button
          onClick={logout}
          style={{
            width: "100%", padding: "8px", marginTop: "8px", background: "transparent",
            border: "1px solid #330000", color: "#552222", fontFamily: "Courier New",
            cursor: "pointer", letterSpacing: "2px"
          }}
        >
          ABORT AND LOGOUT
        </button>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const { colors } = useContext(ThemeContext);

  if (loading) {
    return (
      <div style={{ height: "100vh", background: colors.bg, display: "flex",
        alignItems: "center", justifyContent: "center",
        color: colors.accent, fontFamily: "Courier New",
        fontSize: "11px", letterSpacing: "3px" }}>
        INITIALIZING GOD'S EYE...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.must_change_password) {
    return <PasswordResetRequired />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column",
      height: "100vh", background: colors.bg, transition: "all 0.5s" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/identity" element={<IdentityEngine />} />
            <Route path="/cyber" element={<CyberIntel />} />
            <Route path="/geo" element={<GeoTracker />} />
            <Route path="/news" element={<NewsMonitor />} />
            <Route path="/visual" element={<VisualIntel />} />
            <Route path="/ai" element={<AIBrain />} />
            <Route path="/recon" element={<UsernameRecon />} />
            <Route path="/threat-score" element={<ThreatScore />} />
            <Route path="/api-health" element={<APIHealth />} />
            <Route path="/graph" element={<IntelGraph />} />
            <Route path="/playbooks" element={<Playbooks />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/wifi-recon" element={<WirelessRecon />} />
            <Route path="/crypto-tracker" element={<CryptoTracker />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function LoginGate() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginGate />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
