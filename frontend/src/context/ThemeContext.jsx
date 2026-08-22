/* eslint-disable react-refresh/only-export-components */
import { useState, useContext, createContext } from "react";

// Theme Context
export const ThemeContext = createContext({
  theme: "red",
  toggleTheme: () => {},
});

export const THEMES = {
  red: {
    name: "GOD'S EYE MODE",
    bg: "#000000",
    panel: "#030000",
    card: "#060000",
    border: "#440000",
    borderBright: "#ff0000",
    text: "#ff2222",
    textDim: "#662222",
    textFaint: "#330000",
    accent: "#ff0000",
    accentDim: "#880000",
    scanline: "rgba(255,0,0,0.15)",
    ticker: "#ff4444",
    navBg: "#060000",
    sidebarBg: "#030000",
    loginBg: "#000000",
  },
  stealth: {
    name: "ANALYST MODE",
    bg: "#0a0f1a",
    panel: "#0d1424",
    card: "#111827",
    border: "#1e3a5f",
    borderBright: "#2563eb",
    text: "#93c5fd",
    textDim: "#3b82f6",
    textFaint: "#1e3a5f",
    accent: "#2563eb",
    accentDim: "#1d4ed8",
    scanline: "rgba(37,99,235,0.08)",
    ticker: "#60a5fa",
    navBg: "#0d1424",
    sidebarBg: "#0a0f1a",
    loginBg: "#060d1a",
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("ge_theme") || "red");
  const toggleTheme = () => {
    const next = theme === "red" ? "stealth" : "red";
    setTheme(next);
    localStorage.setItem("ge_theme", next);
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: THEMES[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const isRed = theme === "red";

  return (
    <div onClick={toggleTheme}
      style={{ display: "flex", alignItems: "center", gap: "8px",
        cursor: "pointer", padding: "4px 10px",
        border: `1px solid ${colors.border}`,
        background: colors.card }}>
      {/* Toggle track */}
      <div style={{ width: "32px", height: "16px", borderRadius: "8px",
        background: isRed ? "#330000" : "#1e3a5f",
        border: `1px solid ${colors.accent}`,
        position: "relative", transition: "all 0.3s" }}>
        <div style={{
          position: "absolute", top: "2px",
          left: isRed ? "2px" : "16px",
          width: "10px", height: "10px", borderRadius: "50%",
          background: colors.accent,
          transition: "left 0.3s",
          boxShadow: `0 0 6px ${colors.accent}`
        }} />
      </div>
      <span style={{ fontSize: "9px", color: colors.accent,
        letterSpacing: "1px", fontFamily: "Courier New" }}>
        {isRed ? "GOD'S EYE" : "ANALYST"}
      </span>
    </div>
  );
}
