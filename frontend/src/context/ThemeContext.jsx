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
    bg: "#020902",
    panel: "#051005",
    card: "#081a08",
    border: "#0f3314",
    borderBright: "#00ff41",
    text: "#a3ffa3",
    textDim: "#00dd30",
    textFaint: "#0f3d16",
    accent: "#00ff41",
    accentDim: "#008f11",
    scanline: "rgba(0, 255, 65, 0.08)",
    ticker: "#44ff66",
    navBg: "#051005",
    sidebarBg: "#020902",
    loginBg: "#010601",
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
        background: isRed ? "#330000" : "#09220c",
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
