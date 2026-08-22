import { useState, useEffect } from "react";
import Globe3D from "../components/dashboard/Globe3D";

const LIVE_FEEDS = [
  { tag: "[BREACH]", msg: "192.168.x.x flagged — AbuseIPDB 94%" },
  { tag: "[FACE]", msg: "97% match found — 3 platforms" },
  { tag: "[GEO]", msg: "Flight tracked — EU airspace" },
  { tag: "[MALWARE]", msg: "DarkRAT v2 — VirusTotal 18/70" },
  { tag: "[OSINT]", msg: "Email leak — 2.1M records" },
  { tag: "[VESSEL]", msg: "Unidentified ship — Indian Ocean" },
  { tag: "[DOMAIN]", msg: "Phishing kit detected — URLScan" },
  { tag: "[THREAT]", msg: "CVE-2025-1337 — Critical" },
  { tag: "[CYBER]", msg: "Port scan — Shodan alert" },
  { tag: "[INTEL]", msg: "Dark web mention — IntelX" },
  { tag: "[RECON]", msg: "Username found — 12 platforms" },
  { tag: "[NEWS]", msg: "GDELT: Cyberwar escalation" },
];

const MODULES = [
  { label: "IDENTITY ENGINE", path: "/identity", icon: "[ I ]", desc: "Face scan + OSINT" },
  { label: "CYBER INTEL", path: "/cyber", icon: "[ C ]", desc: "IP / Domain / Threats" },
  { label: "GEO TRACKER", path: "/geo", icon: "[ G ]", desc: "Flights / Ships / Maps" },
  { label: "NEWS MONITOR", path: "/news", icon: "[ N ]", desc: "Global intel feed" },
  { label: "VISUAL INTEL", path: "/visual", icon: "[ V ]", desc: "Image + EXIF + GPS" },
  { label: "AI BRAIN", path: "/ai", icon: "[ A ]", desc: "LLaMA 3.3 70B" },
  { label: "USERNAME RECON", path: "/recon", icon: "[ U ]", desc: "30+ platforms" },
  { label: "INTEL GRAPH", path: "/graph", icon: "[ G ]", desc: "Relationship map" },
  { label: "PLAYBOOKS", path: "/playbooks", icon: "[ PB ]", desc: "Investigation templates" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("FEED");
  const [time, setTime] = useState(new Date());
  const [, setFeedIndex] = useState(0);
  const [visibleFeeds, setVisibleFeeds] = useState(LIVE_FEEDS.slice(0, 5));

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setFeedIndex(i => {
        const next = (i + 1) % LIVE_FEEDS.length;
        setVisibleFeeds(prev => [LIVE_FEEDS[next], ...prev.slice(0, 9)]);
        return next;
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { val: "10,731+", lbl: "AIRCRAFT LIVE" },
    { val: "64,000+", lbl: "VESSELS" },
    { val: "45+", lbl: "APIS ACTIVE" },
    { val: "CRITICAL", lbl: "THREAT LEVEL", red: true },
  ];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* Center */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

        {/* Scan line */}
        <div style={{ position: "absolute", left: 0, right: 0, height: "1px", zIndex: 5,
          background: "rgba(255,0,0,0.15)", pointerEvents: "none",
          animation: "scan 2s linear infinite" }} />
        <style>{`@keyframes scan { 0%{top:0} 100%{top:100%} }`}</style>

        {/* Live IST Clock */}
        <div style={{ padding: "6px 16px", background: "#060000",
          borderBottom: "1px solid #1a0000", display: "flex",
          justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "10px", color: "#440000", letterSpacing: "2px" }}>
            OMNIVISION INTELLIGENCE DASHBOARD
          </div>
          <div style={{ fontSize: "11px", color: "#ff0000",
            fontFamily: "Courier New", letterSpacing: "2px" }}>
            {time.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false })} IST
            &nbsp;|&nbsp;
            {time.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" })}
          </div>
        </div>

        {/* Globe */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Globe3D />
        </div>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "4px",
          padding: "8px 12px", borderTop: "1px solid #1a0000" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "8px 4px",
              background: "#060000", border: "1px solid #440000",
              borderTop: "2px solid #ff0000" }}>
              <div style={{ fontSize: "16px", fontWeight: "bold",
                color: s.red ? "#ff4400" : "#ff0000",
                fontFamily: "Courier New" }}>{s.val}</div>
              <div style={{ fontSize: "8px", color: "#552222",
                letterSpacing: "1px", marginTop: "2px" }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Module cards */}
        <div style={{ padding: "8px 12px 10px",
          borderTop: "1px solid #1a0000", background: "#030000" }}>
          <div style={{ fontSize: "9px", color: "#440000",
            letterSpacing: "2px", marginBottom: "6px" }}>
            QUICK ACCESS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "4px" }}>
            {MODULES.slice(0, 9).map((m, i) => (
              <a key={i} href={m.path}
                style={{ padding: "6px 8px", background: "#060000",
                  border: "1px solid #330000", textDecoration: "none",
                  display: "block", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff0000"; e.currentTarget.style.background = "#0d0000"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#330000"; e.currentTarget.style.background = "#060000"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "9px", color: "#ff4400", fontFamily: "Courier New" }}>{m.icon}</span>
                  <span style={{ fontSize: "9px", color: "#882222", letterSpacing: "1px" }}>{m.label}</span>
                </div>
                <div style={{ fontSize: "8px", color: "#330000", marginTop: "2px" }}>{m.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: "200px", borderLeft: "1px solid #440000",
        background: "#030000", display: "flex", flexDirection: "column" }}>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #330000" }}>
          {["FEED", "STATUS", "ACTIONS"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: "7px 2px", fontSize: "8px", letterSpacing: "1px",
                cursor: "pointer", fontFamily: "Courier New",
                color: activeTab === tab ? "#ff0000" : "#440000",
                background: "transparent", border: "none",
                borderBottom: activeTab === tab ? "2px solid #ff0000" : "2px solid transparent" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* FEED Tab */}
        {activeTab === "FEED" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            <div style={{ fontSize: "9px", color: "#ff0000",
              letterSpacing: "2px", marginBottom: "6px" }}>
              LIVE THREATS
            </div>
            {visibleFeeds.map((f, i) => (
              <div key={i} style={{ padding: "5px 0", borderBottom: "1px solid #0d0000",
                opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.08),
                transition: "opacity 0.5s" }}>
                <div style={{ fontSize: "9px", color: "#ff0000",
                  fontWeight: "bold" }}>{f.tag}</div>
                <div style={{ fontSize: "9px", color: "#552222",
                  lineHeight: "1.4", marginTop: "1px" }}>{f.msg}</div>
              </div>
            ))}
          </div>
        )}

        {/* STATUS Tab */}
        {activeTab === "STATUS" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            <div style={{ fontSize: "9px", color: "#ff0000",
              letterSpacing: "2px", marginBottom: "6px" }}>
              API STATUS
            </div>
            {[
              ["Groq AI", true], ["OpenSky", true], ["NewsAPI", true],
              ["VirusTotal", true], ["Shodan", true], ["AbuseIPDB", true],
              ["LeakCheck", true], ["GDELT", true], ["OpenWeather", true],
              ["Nominatim", true], ["URLScan", true], ["SauceNAO", true],
              ["HIBP", false], ["BreachDir", true],
            ].map(([name, online]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between",
                padding: "4px 0", borderBottom: "1px solid #0d0000",
                fontSize: "9px" }}>
                <span style={{ color: "#552222" }}>{name}</span>
                <span style={{ color: online ? "#00aa44" : "#ff0000",
                  fontWeight: "bold" }}>
                  {online ? "●" : "○"}
                </span>
              </div>
            ))}
            <div style={{ marginTop: "8px" }}>
              <a href="/api-health" style={{ display: "block", padding: "6px",
                background: "#060000", border: "1px solid #330000",
                color: "#552222", fontSize: "9px", textDecoration: "none",
                textAlign: "center", letterSpacing: "1px" }}>
                FULL HEALTH REPORT →
              </a>
            </div>
          </div>
        )}

        {/* ACTIONS Tab */}
        {activeTab === "ACTIONS" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            <div style={{ fontSize: "9px", color: "#ff0000",
              letterSpacing: "2px", marginBottom: "6px" }}>
              QUICK ACTIONS
            </div>
            {[
              { label: "Load Live Flights", href: "/geo" },
              { label: "Scan IP: 8.8.8.8", href: "/cyber" },
              { label: "Run Username Recon", href: "/recon" },
              { label: "Person Investigation", href: "/playbooks" },
              { label: "Build Intel Graph", href: "/graph" },
              { label: "Check API Health", href: "/api-health" },
              { label: "Calculate Threat Score", href: "/threat-score" },
              { label: "Generate Report", href: "/reports" },
            ].map((action, i) => (
              <a key={i} href={action.href}
                style={{ display: "block", padding: "7px 8px", marginBottom: "4px",
                  background: "#060000", border: "1px solid #330000",
                  color: "#662222", fontSize: "9px", textDecoration: "none",
                  letterSpacing: "1px" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff0000"; e.currentTarget.style.color = "#ff0000"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#330000"; e.currentTarget.style.color = "#662222"; }}>
                → {action.label}
              </a>
            ))}
          </div>
        )}

        {/* Bottom threat bar */}
        <div style={{ padding: "8px", borderTop: "1px solid #330000" }}>
          <div style={{ fontSize: "8px", color: "#440000",
            letterSpacing: "2px", marginBottom: "4px" }}>
            THREAT LEVEL
          </div>
          <div style={{ height: "4px", background: "#0d0000",
            border: "1px solid #330000", marginBottom: "3px" }}>
            <div style={{ height: "100%", width: "87%", background: "#ff0000" }} />
          </div>
          <div style={{ fontSize: "9px", color: "#ff0000",
            textAlign: "right", letterSpacing: "1px" }}>
            87% CRITICAL
          </div>
        </div>
      </div>
    </div>
  );
}
