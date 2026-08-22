import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:8000";

export default function Logs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const MODULES = ["ALL", "AUTH", "IDENTITY", "CYBER", "GEO", "NEWS", "AI"];

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/auth/logs?limit=200`);
      setLogs(res.data.logs || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { setTimeout(loadLogs, 0); }, []);


  const filtered = filter === "ALL" ? logs : logs.filter(l => l.module === filter);

  const formatTime = (ts) => {
    try { return new Date(ts).toLocaleString(); } catch { return ts; }
  };

  const moduleColor = (mod) => {
    const colors = {
      AUTH: "#ff0000", IDENTITY: "#ff4400", CYBER: "#ff2200",
      GEO: "#ff4400", NEWS: "#ff3300", AI: "#ff0000"
    };
    return colors[mod] || "#882222";
  };

  if (user?.role === "STUDENT") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", background: "#000000" }}>
        <div style={{ color: "#ff0000", fontFamily: "Courier New",
          fontSize: "13px", letterSpacing: "3px" }}>
          ACCESS DENIED — INSUFFICIENT CLEARANCE
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* Left */}
      <div style={{ width: "200px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          ACTIVITY LOGS
        </div>

        <div style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px" }}>FILTER MODULE</div>
        {MODULES.map(m => (
          <button key={m} onClick={() => setFilter(m)}
            style={{
              width: "100%", padding: "7px", fontSize: "11px",
              letterSpacing: "1px", cursor: "pointer", fontFamily: "Courier New",
              textAlign: "left", background: filter === m ? "#1a0000" : "#060000",
              border: `1px solid ${filter === m ? "#ff0000" : "#330000"}`,
              color: filter === m ? "#ff0000" : "#552222",
            }}>
            {m}
          </button>
        ))}

        <div style={{ borderTop: "1px solid #220000", marginTop: "8px" }} />

        <button onClick={loadLogs}
          style={{ width: "100%", padding: "8px", fontSize: "11px",
            cursor: "pointer", fontFamily: "Courier New",
            background: "#1a0000", border: "1px solid #ff0000", color: "#ff0000" }}>
          REFRESH
        </button>

        <div style={{ marginTop: "auto", padding: "8px",
          background: "#060000", border: "1px solid #330000" }}>
          <div style={{ fontSize: "10px", color: "#440000", marginBottom: "4px" }}>TOTAL ENTRIES</div>
          <div style={{ fontSize: "20px", color: "#ff0000", fontWeight: "bold" }}>{logs.length}</div>
        </div>
      </div>

      {/* Right */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid #330000",
          background: "#060000", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>
            SYSTEM ACTIVITY LOG
          </div>
          <div style={{ color: "#440000", fontSize: "11px" }}>
            {filtered.length} ENTRIES
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {loading ? (
            <div style={{ color: "#ff0000", fontSize: "11px",
              letterSpacing: "3px", textAlign: "center", marginTop: "40px" }}
              className="animate-pulse">
              LOADING ACTIVITY LOG...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ color: "#330000", fontSize: "11px",
              letterSpacing: "3px", textAlign: "center", marginTop: "40px" }}>
              NO LOG ENTRIES FOUND
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #440000" }}>
                  {["#", "TIMESTAMP", "USER", "MODULE", "ACTION", "TARGET"].map(h => (
                    <th key={h} style={{ padding: "6px 10px", textAlign: "left",
                      color: "#ff4400", fontWeight: "normal", letterSpacing: "1px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={log.id} style={{
                    borderBottom: "1px solid #0d0000",
                    background: i % 2 === 0 ? "#060000" : "#080000"
                  }}>
                    <td style={{ padding: "6px 10px", color: "#330000" }}>{log.id}</td>
                    <td style={{ padding: "6px 10px", color: "#552222" }}>{formatTime(log.timestamp)}</td>
                    <td style={{ padding: "6px 10px", color: "#ff4400" }}>{log.username}</td>
                    <td style={{ padding: "6px 10px" }}>
                      <span style={{ color: moduleColor(log.module),
                        padding: "2px 6px", border: `1px solid ${moduleColor(log.module)}`,
                        fontSize: "10px" }}>
                        {log.module}
                      </span>
                    </td>
                    <td style={{ padding: "6px 10px", color: "#882222" }}>{log.action}</td>
                    <td style={{ padding: "6px 10px", color: "#552222" }}>{log.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
