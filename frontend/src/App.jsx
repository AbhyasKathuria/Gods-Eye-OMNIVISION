import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, ThemeContext } from "./context/ThemeContext";
import { useContext } from "react";
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
