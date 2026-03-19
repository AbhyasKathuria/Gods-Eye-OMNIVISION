import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function APIHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/recon/api-health`);
      setHealth(res.data);
      setLastChecked(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status === "ONLINE") return "#00aa44";
    if (status === "DEGRADED") return "#ff8800";
    return "#ff0000";
  };

  const getLatencyColor = (ms) => {
    if (!ms) return "#552222";
    if (ms < 500) return "#00aa44";
    if (ms < 1500) return "#ff8800";
    return "#ff0000";
  };

  return (
    <div style={{ height: "100%", overflowY: "auto", background: "#000000", padding: "16px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #440000" }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>
          API HEALTH DASHBOARD
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {lastChecked && (
            <div style={{ color: "#440000", fontSize: "10px" }}>
              Last checked: {lastChecked} IST
            </div>
          )}
          <button onClick={() => setAutoRefresh(!autoRefresh)}
            style={{ padding: "5px 12px", fontSize: "10px", cursor: "pointer",
              fontFamily: "Courier New", background: autoRefresh ? "#1a0000" : "#060000",
              border: `1px solid ${autoRefresh ? "#ff0000" : "#440000"}`,
              color: autoRefresh ? "#ff0000" : "#552222" }}>
            {autoRefresh ? "AUTO: ON" : "AUTO: OFF"}
          </button>
          <button onClick={loadHealth} disabled={loading}
            style={{ padding: "5px 12px", fontSize: "10px", cursor: "pointer",
              fontFamily: "Courier New", background: "#1a0000",
              border: "1px solid #ff0000", color: "#ff0000" }}>
            {loading ? "CHECKING..." : "REFRESH"}
          </button>
        </div>
      </div>

      {loading && !health && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          height: "60%", color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
          className="animate-pulse">
          PINGING ALL APIs...
        </div>
      )}

      {health && (
        <>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px", marginBottom: "16px" }}>
            {[
              { val: health.summary.online, lbl: "ONLINE", color: "#00aa44" },
              { val: health.summary.offline, lbl: "OFFLINE", color: "#ff0000" },
              { val: health.summary.total, lbl: "TOTAL APIs", color: "#ff4400" },
              { val: `${health.summary.health_percent}%`, lbl: "HEALTH", color: health.summary.health_percent > 80 ? "#00aa44" : "#ff4400" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "12px", background: "#060000",
                border: "1px solid #440000", borderTop: `2px solid ${s.color}`, textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: s.color }}>{s.val}</div>
                <div style={{ fontSize: "9px", color: "#552222", letterSpacing: "2px", marginTop: "4px" }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Overall health bar */}
          <div style={{ marginBottom: "16px", padding: "12px", background: "#060000",
            border: "1px solid #440000" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "#ff4400", fontSize: "10px", letterSpacing: "2px" }}>SYSTEM HEALTH</span>
              <span style={{ color: "#ff0000", fontSize: "10px" }}>{health.summary.health_percent}%</span>
            </div>
            <div style={{ height: "6px", background: "#0d0000", border: "1px solid #330000" }}>
              <div style={{
                height: "100%",
                width: `${health.summary.health_percent}%`,
                background: health.summary.health_percent > 80 ? "#00aa44" :
                  health.summary.health_percent > 50 ? "#ff8800" : "#ff0000",
                transition: "width 0.5s ease"
              }} />
            </div>
          </div>

          {/* API Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "8px" }}>
            {health.apis.map((api, i) => (
              <div key={i} style={{
                padding: "12px", background: "#060000",
                border: `1px solid ${api.status === "ONLINE" ? "#1a3a1a" : api.status === "DEGRADED" ? "#3a2a00" : "#3a0000"}`,
                borderLeft: `3px solid ${getStatusColor(api.status)}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#ff2222", fontSize: "11px", fontWeight: "bold" }}>
                    {api.api}
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: "bold",
                    color: getStatusColor(api.status) }}>
                    {api.status}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "10px", color: "#552222" }}>
                    Code: {api.code || "N/A"}
                  </span>
                  {api.latency_ms && (
                    <span style={{ fontSize: "10px", color: getLatencyColor(api.latency_ms) }}>
                      {api.latency_ms}ms
                    </span>
                  )}
                  {api.error && (
                    <span style={{ fontSize: "9px", color: "#552222" }}>
                      {api.error.slice(0, 30)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Offline warning */}
          {health.summary.offline > 0 && (
            <div style={{ marginTop: "16px", padding: "12px",
              background: "#0d0000", border: "1px solid #ff0000" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "2px", marginBottom: "6px" }}>
                {health.summary.offline} API(S) OFFLINE — POSSIBLE QUOTA EXHAUSTION
              </div>
              <div style={{ color: "#662222", fontSize: "10px", lineHeight: "1.6" }}>
                Offline APIs may have exhausted their free tier quotas. Features using these APIs will show errors or empty results. Check your .env API keys or wait for quota reset (usually midnight UTC).
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
