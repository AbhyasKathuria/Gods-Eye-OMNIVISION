import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";

const modules = [
  { icon: "[ D ]", label: "DASHBOARD", path: "/" },
  { icon: "[ I ]", label: "IDENTITY ENGINE", path: "/identity" },
  { icon: "[ C ]", label: "CYBER INTEL", path: "/cyber" },
  { icon: "[ G ]", label: "GEO TRACKER", path: "/geo" },
  { icon: "[ N ]", label: "NEWS MONITOR", path: "/news" },
  { icon: "[ V ]", label: "VISUAL INTEL", path: "/visual" },
  { icon: "[ A ]", label: "AI BRAIN", path: "/ai" },
  { icon: "[ U ]", label: "USERNAME RECON", path: "/recon" },
  { icon: "[ GR ]", label: "INTEL GRAPH", path: "/graph" },
  { icon: "[ PB ]", label: "PLAYBOOKS", path: "/playbooks" },
];

const tools = [
  { icon: "[ T ]", label: "THREAT SCORE", path: "/threat-score" },
  { icon: "[ H ]", label: "API HEALTH", path: "/api-health" },
  { icon: "[ R ]", label: "REPORTS", path: "/reports" },
  { icon: "[ S ]", label: "SETTINGS", path: "/settings" },
  { icon: "[ L ]", label: "LOGS", path: "/logs" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useContext(ThemeContext);
  const isActive = (path) => location.pathname === path;

  const itemStyle = (path) => ({
    padding: "7px 12px", fontSize: "10px", cursor: "pointer",
    letterSpacing: "1px", display: "flex", alignItems: "center", gap: "7px",
    color: isActive(path) ? colors.accent : colors.textDim,
    borderLeft: isActive(path) ? `2px solid ${colors.accent}` : "2px solid transparent",
    background: isActive(path) ? colors.card : "transparent",
    transition: "all 0.2s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column",
      background: colors.sidebarBg, borderRight: `1px solid ${colors.border}`,
      width: "185px", height: "100%", overflowY: "auto",
      transition: "all 0.5s" }}>

      <div style={{ padding: "10px 0" }}>
        <div style={{ padding: "6px 14px 4px", fontSize: "8px",
          color: colors.textFaint, letterSpacing: "3px" }}>
          MODULES
        </div>

        {modules.map(m => (
          <div key={m.path} onClick={() => navigate(m.path)}
            style={itemStyle(m.path)}
            onMouseEnter={e => { if (!isActive(m.path)) { e.currentTarget.style.color = colors.text; e.currentTarget.style.background = colors.card; }}}
            onMouseLeave={e => { if (!isActive(m.path)) { e.currentTarget.style.color = colors.textDim; e.currentTarget.style.background = "transparent"; }}}>
            <span style={{ fontSize: "8px", color: isActive(m.path) ? colors.accent : colors.textFaint,
              fontFamily: "Courier New" }}>
              {m.icon}
            </span>
            {m.label}
          </div>
        ))}

        <div style={{ padding: "10px 14px 4px", fontSize: "8px",
          color: colors.textFaint, letterSpacing: "3px", marginTop: "4px" }}>
          TOOLS
        </div>

        {tools.map(t => (
          <div key={t.path} onClick={() => navigate(t.path)}
            style={itemStyle(t.path)}
            onMouseEnter={e => { if (!isActive(t.path)) { e.currentTarget.style.color = colors.text; e.currentTarget.style.background = colors.card; }}}
            onMouseLeave={e => { if (!isActive(t.path)) { e.currentTarget.style.color = colors.textDim; e.currentTarget.style.background = "transparent"; }}}>
            <span style={{ fontSize: "8px", color: colors.textFaint, fontFamily: "Courier New" }}>
              {t.icon}
            </span>
            {t.label}
          </div>
        ))}
      </div>

      {/* Threat Level */}
      <div style={{ marginTop: "auto", padding: "8px 12px",
        borderTop: `1px solid ${colors.border}` }}>
        <div style={{ fontSize: "8px", color: colors.textFaint,
          letterSpacing: "2px", marginBottom: "4px" }}>
          THREAT LEVEL
        </div>
        <div style={{ height: "3px", background: colors.card,
          border: `1px solid ${colors.border}`, marginBottom: "3px" }}>
          <div style={{ height: "100%", width: "87%", background: colors.accent }} />
        </div>
        <div style={{ fontSize: "8px", color: colors.accent,
          textAlign: "right" }}>87% CRITICAL</div>
        <div style={{ fontSize: "7px", color: colors.textFaint,
          marginTop: "4px", letterSpacing: "1px" }}>
          OMNIVISION v1.0
        </div>
      </div>
    </div>
  );
}
