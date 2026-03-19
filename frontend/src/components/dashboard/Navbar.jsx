import { useState, useEffect, useContext } from "react";
import GodsEyeLogo from "./GodsEyeLogo";
import { ThemeToggle, ThemeContext } from "../../context/ThemeContext";

const TICKER_ITEMS = [
  "BREACH DETECTED: 192.168.x.x",
  "FACE MATCH: 97% CONFIDENCE",
  "FLIGHT SIGNAL ACQUIRED",
  "MALWARE STRAIN: DARKRAT v2",
  "IP BLACKLISTED: RUSSIA",
  "DOMAIN FLAGGED: PHISHING",
  "VESSEL OFF COAST: UNIDENTIFIED",
  "SHODAN: 12K EXPOSED DEVICES",
  "REDDIT TRENDING: #DATABREACH",
  "GDELT: GLOBAL THREAT LEVEL HIGH",
  "OPENSKY: 10K+ AIRCRAFT LIVE",
  "USERNAME FOUND: 12 PLATFORMS",
];

export default function Navbar() {
  const [time, setTime] = useState(new Date());
  const { colors } = useContext(ThemeContext);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ borderBottom: `2px solid ${colors.borderBright}`,
      background: colors.navBg, transition: "all 0.5s" }}>

      {/* Main bar */}
      <div style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "6px 16px" }}>

        {/* Logo + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <GodsEyeLogo size={40} />
          <div>
            <div style={{ color: colors.accent, fontSize: "17px", fontFamily: "Courier New",
              fontWeight: "bold", letterSpacing: "5px", lineHeight: "1" }}>
              GOD'S EYE
            </div>
            <div style={{ color: colors.textFaint, fontSize: "8px",
              fontFamily: "Courier New", letterSpacing: "3px" }}>
              OMNIVISION
            </div>
          </div>
        </div>

        {/* Status dots */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {["THREAT LEVEL: CRITICAL", "45 APIs ACTIVE", "LIVE"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%",
                background: colors.accent,
                animation: "blink 0.6s infinite",
                boxShadow: `0 0 4px ${colors.accent}` }} />
              <span style={{ fontSize: "10px", color: colors.ticker,
                fontFamily: "Courier New", letterSpacing: "1px" }}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Right side: theme toggle + time */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ThemeToggle />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: colors.textDim,
              fontFamily: "Courier New", letterSpacing: "1px" }}>
              {time.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false })} IST
            </div>
            <div style={{ fontSize: "8px", color: colors.textFaint,
              fontFamily: "Courier New", letterSpacing: "2px" }}>
              v1.0
            </div>
          </div>
        </div>
      </div>

      {/* Threat bar */}
      <div style={{ height: "2px", background: "#0d0000" }}>
        <div style={{ height: "100%", width: "87%",
          background: `linear-gradient(to right, ${colors.accentDim}, ${colors.accent})`,
          transition: "all 0.5s" }} />
      </div>

      {/* Ticker */}
      <div style={{ overflow: "hidden", padding: "2px 0",
        borderTop: `1px solid ${colors.textFaint}`,
        background: colors.panel }}>
        <div style={{ whiteSpace: "nowrap", display: "inline-block",
          animation: "ticker 35s linear infinite",
          fontFamily: "Courier New", fontSize: "10px",
          color: colors.ticker, letterSpacing: "1px" }}>
          <style>{`
            @keyframes ticker { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
            @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
          `}</style>
          {TICKER_ITEMS.join("   |   ")}
        </div>
      </div>
    </div>
  );
}
