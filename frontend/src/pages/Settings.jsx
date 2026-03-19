import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleColor = (role) => {
    if (role === "ADMIN") return "#ff0000";
    if (role === "RESEARCHER") return "#ff4400";
    return "#ff8800";
  };

  const s = {
    section: { marginBottom: "16px", padding: "14px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "12px" },
    row: { display: "flex", justifyContent: "space-between", marginBottom: "8px",
      padding: "8px", background: "#0d0000", border: "1px solid #220000" },
    label: { fontSize: "11px", color: "#ff4400" },
    value: { fontSize: "11px", color: "#882222" },
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#000000", padding: "24px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>

        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          marginBottom: "20px", borderBottom: "1px solid #440000", paddingBottom: "10px" }}>
          SETTINGS & PROFILE
        </div>

        {/* Profile */}
        <div style={s.section}>
          <div style={s.title}>OPERATOR PROFILE</div>
          {[
            ["USERNAME", user?.username],
            ["FULL NAME", user?.name],
            ["ROLE", user?.role],
            ["CLEARANCE LEVEL", user?.clearance],
          ].map(([k, v]) => (
            <div key={k} style={s.row}>
              <span style={s.label}>{k}</span>
              <span style={{ ...s.value, color: k === "ROLE" ? roleColor(v) : "#882222" }}>
                {v || "N/A"}
              </span>
            </div>
          ))}
        </div>

        {/* Permissions */}
        <div style={s.section}>
          <div style={s.title}>MODULE PERMISSIONS</div>
          {[
            ["IDENTITY ENGINE", true],
            ["CYBER INTELLIGENCE", true],
            ["GEO TRACKER", true],
            ["NEWS MONITOR", true],
            ["AI BRAIN", true],
            ["ACTIVITY LOGS", user?.role !== "STUDENT"],
            ["ADMIN PANEL", user?.role === "ADMIN"],
          ].map(([mod, allowed]) => (
            <div key={mod} style={s.row}>
              <span style={s.label}>{mod}</span>
              <span style={{ fontSize: "11px", color: allowed ? "#00aa44" : "#ff0000" }}>
                {allowed ? "GRANTED" : "RESTRICTED"}
              </span>
            </div>
          ))}
        </div>

        {/* System Info */}
        <div style={s.section}>
          <div style={s.title}>SYSTEM INFORMATION</div>
          {[
            ["PLATFORM", "OMNIVISION v1.0"],
            ["DEVELOPER", "Abhyas Kathuria"],
            ["INSTITUTION", "Presidency University, Bangalore"],
            ["APIS CONNECTED", "45+"],
            ["SESSION EXPIRES", "8 hours from login"],
          ].map(([k, v]) => (
            <div key={k} style={s.row}>
              <span style={s.label}>{k}</span>
              <span style={s.value}>{v}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          style={{
            width: "100%", padding: "12px",
            background: "#1a0000", border: "1px solid #ff0000",
            color: "#ff0000", fontFamily: "Courier New",
            fontSize: "12px", letterSpacing: "3px", cursor: "pointer",
          }}>
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );
}
