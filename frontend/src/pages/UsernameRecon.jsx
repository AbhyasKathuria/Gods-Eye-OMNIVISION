import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function UsernameRecon() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [results, setResults] = useState(null);
  const [breachResults, setBreachResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [breachLoading, setBreachLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("USERNAME");

  const runRecon = async () => {
    if (!username.trim()) return;
    setLoading(true);
    setResults(null);
    try {
      const res = await axios.get(`${API}/recon/username/${encodeURIComponent(username.trim())}`);
      setResults(res.data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const runBreach = async () => {
    if (!email.trim()) return;
    setBreachLoading(true);
    setBreachResults(null);
    try {
      const res = await axios.get(`${API}/recon/breach/${encodeURIComponent(email.trim())}`);
      setBreachResults(res.data.data);
    } catch (e) { console.error(e); }
    setBreachLoading(false);
  };

  const getRiskColor = (level) => {
    if (level === "HIGH") return "#ff0000";
    if (level === "MEDIUM") return "#ff8800";
    return "#00aa44";
  };

  const getSourceColor = (status) => {
    if (status === "found") return "#ff0000";
    if (status === "clean") return "#00aa44";
    if (status === "no_key") return "#ff8800";
    return "#552222";
  };

  const s = {
    section: { marginBottom: "16px", padding: "12px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" },
    found: { padding: "8px", marginBottom: "6px", border: "1px solid #440000", background: "#0d0000", borderLeft: "3px solid #ff0000" },
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* Left Panel */}
      <div style={{ width: "260px", display: "flex", flexDirection: "column", gap: "12px",
        padding: "12px", borderRight: "1px solid #440000", background: "#030000", overflowY: "auto" }}>

        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          USERNAME RECON
        </div>

        {["USERNAME", "BREACH CHECK"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ width: "100%", padding: "8px", fontSize: "11px", letterSpacing: "1px",
              cursor: "pointer", fontFamily: "Courier New", textAlign: "left",
              background: activeTab === tab ? "#1a0000" : "#060000",
              border: `1px solid ${activeTab === tab ? "#ff0000" : "#330000"}`,
              color: activeTab === tab ? "#ff0000" : "#552222" }}>
            {tab}
          </button>
        ))}

        <div style={{ borderTop: "1px solid #220000" }} />

        {activeTab === "USERNAME" && (
          <div>
            <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px" }}>TARGET USERNAME</div>
            <input type="text" placeholder="e.g. johndoe123"
              value={username} onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && runRecon()}
              style={{ width: "100%", background: "#060000", border: "1px solid #440000",
                borderLeft: "3px solid #ff0000", color: "#ff2222",
                fontFamily: "Courier New", fontSize: "11px", padding: "8px 12px" }} />
            <button onClick={runRecon} disabled={!username.trim() || loading}
              style={{ width: "100%", padding: "8px", marginTop: "6px", fontSize: "11px",
                letterSpacing: "1px", cursor: "pointer", fontFamily: "Courier New",
                background: username ? "#1a0000" : "#060000",
                border: `1px solid ${username ? "#ff0000" : "#440000"}`,
                color: username ? "#ff0000" : "#662222" }}>
              {loading ? "SCANNING 30+ PLATFORMS..." : "RUN USERNAME RECON"}
            </button>
          </div>
        )}

        {activeTab === "BREACH CHECK" && (
          <div>
            <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px" }}>TARGET EMAIL</div>
            <input type="text" placeholder="e.g. user@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && runBreach()}
              style={{ width: "100%", background: "#060000", border: "1px solid #440000",
                borderLeft: "3px solid #ff0000", color: "#ff2222",
                fontFamily: "Courier New", fontSize: "11px", padding: "8px 12px" }} />
            <button onClick={runBreach} disabled={!email.trim() || breachLoading}
              style={{ width: "100%", padding: "8px", marginTop: "6px", fontSize: "11px",
                cursor: "pointer", fontFamily: "Courier New",
                background: email ? "#1a0000" : "#060000",
                border: `1px solid ${email ? "#ff0000" : "#440000"}`,
                color: email ? "#ff0000" : "#662222" }}>
              {breachLoading ? "CHECKING DATABASES..." : "CHECK BREACH DATABASES"}
            </button>

            {/* Sources explained */}
            <div style={{ marginTop: "10px", padding: "8px", background: "#060000",
              border: "1px solid #330000" }}>
              <div style={{ color: "#ff4400", fontSize: "10px", marginBottom: "6px", letterSpacing: "1px" }}>
                SOURCES CHECKED
              </div>
              {[
                { name: "LeakCheck.io", status: "FREE", note: "Your existing key" },
                { name: "BreachDirectory", status: "FREE", note: "RapidAPI free tier" },
                { name: "HaveIBeenPwned", status: "PAID", note: "$3.50/mo optional" },
              ].map((src, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between",
                  marginBottom: "4px", fontSize: "10px" }}>
                  <span style={{ color: "#662222" }}>{src.name}</span>
                  <span style={{ color: src.status === "FREE" ? "#00aa44" : "#ff8800" }}>
                    {src.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick tests */}
        <div style={{ borderTop: "1px solid #220000" }} />
        <div style={{ color: "#882222", fontSize: "11px" }}>QUICK TESTS</div>
        {[
          { label: "Username: elonmusk", action: () => { setActiveTab("USERNAME"); setUsername("elonmusk"); } },
          { label: "Username: johndoe", action: () => { setActiveTab("USERNAME"); setUsername("johndoe"); } },
          { label: "Breach: test@test.com", action: () => { setActiveTab("BREACH CHECK"); setEmail("test@test.com"); } },
        ].map((t, i) => (
          <button key={i} onClick={t.action}
            style={{ width: "100%", padding: "6px 8px", marginBottom: "4px", fontSize: "10px",
              cursor: "pointer", fontFamily: "Courier New", textAlign: "left",
              background: "#060000", border: "1px solid #330000", color: "#552222" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid #330000",
          background: "#060000", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>
            {activeTab === "USERNAME" ? "PLATFORM RECONNAISSANCE" : "MULTI-SOURCE BREACH INTELLIGENCE"}
          </div>
          {results && activeTab === "USERNAME" && (
            <div style={{ color: "#440000", fontSize: "11px" }}>
              FOUND ON {results.found_count} / {results.total_checked} PLATFORMS
            </div>
          )}
          {breachResults && activeTab === "BREACH CHECK" && (
            <div style={{ color: getRiskColor(breachResults.risk_level), fontSize: "11px" }}>
              RISK: {breachResults.risk_level}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

          {/* Empty */}
          {!results && !breachResults && !loading && !breachLoading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", color: "#220000" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>[ @ ]</div>
              <div style={{ fontSize: "13px", letterSpacing: "3px" }}>
                {activeTab === "USERNAME" ? "ENTER USERNAME TO SCAN 30+ PLATFORMS" : "ENTER EMAIL TO CHECK 3 BREACH DATABASES"}
              </div>
            </div>
          )}

          {/* Loading */}
          {(loading || breachLoading) && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "12px" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
                className="animate-pulse">
                {loading ? "SCANNING 30+ PLATFORMS..." : "QUERYING BREACH DATABASES..."}
              </div>
              <div style={{ color: "#440000", fontSize: "11px" }}>
                {loading ? "Checking GitHub, Twitter, Instagram, Reddit and more..." : "Checking LeakCheck.io, BreachDirectory, HIBP..."}
              </div>
            </div>
          )}

          {/* USERNAME RESULTS */}
          {activeTab === "USERNAME" && results && !loading && (
            <div>
              <div style={s.section}>
                <div style={s.title}>RECON SUMMARY</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {[
                    ["USERNAME", results.username],
                    ["FOUND ON", results.found_count + " platforms"],
                    ["CHECKED", results.total_checked + " platforms"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: "8px", background: "#0d0000", border: "1px solid #330000" }}>
                      <div style={{ fontSize: "9px", color: "#ff4400", marginBottom: "4px" }}>{k}</div>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#ff0000" }}>{v}</div>
                    </div>
                  ))}
                </div>
                {results.found_count > 0 && (
                  <div style={{ marginTop: "8px", color: "#ff0000", fontSize: "11px",
                    letterSpacing: "2px" }} className="animate-pulse">
                    DIGITAL FOOTPRINT DETECTED
                  </div>
                )}
              </div>

              {results.found_on?.length > 0 && (
                <div style={s.section}>
                  <div style={s.title}>FOUND ON ({results.found_on.length} PLATFORMS)</div>
                  {results.found_on.map((r, i) => (
                    <div key={i} style={s.found}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ color: "#ff0000", fontSize: "11px", fontWeight: "bold" }}>{r.site}</span>
                        <span style={{ color: "#00aa44", fontSize: "10px" }}>FOUND</span>
                      </div>
                      <a href={r.url} target="_blank" rel="noreferrer"
                        style={{ color: "#ff4400", fontSize: "10px", textDecoration: "none" }}>
                        {r.url}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {results.not_found?.length > 0 && (
                <div style={s.section}>
                  <div style={s.title}>NOT FOUND ({results.not_found.length} PLATFORMS)</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {results.not_found.map((site, i) => (
                      <span key={i} style={{ padding: "3px 8px", fontSize: "10px",
                        background: "#0d0000", border: "1px solid #220000", color: "#330000" }}>
                        {site}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BREACH RESULTS */}
          {activeTab === "BREACH CHECK" && breachResults && !breachLoading && (
            <div>
              {/* Summary */}
              <div style={s.section}>
                <div style={s.title}>BREACH INTELLIGENCE SUMMARY</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                  {[
                    ["EMAIL", breachResults.email],
                    ["TOTAL BREACHES", breachResults.total_breaches],
                    ["RISK LEVEL", breachResults.risk_level],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: "8px", background: "#0d0000", border: "1px solid #330000" }}>
                      <div style={{ fontSize: "9px", color: "#ff4400", marginBottom: "4px" }}>{k}</div>
                      <div style={{ fontSize: "13px", fontWeight: "bold",
                        color: k === "RISK LEVEL" ? getRiskColor(v) :
                               k === "TOTAL BREACHES" && v > 0 ? "#ff0000" : "#882222" }}>
                        {String(v)}
                      </div>
                    </div>
                  ))}
                </div>
                {breachResults.total_breaches > 0 && (
                  <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "2px" }}
                    className="animate-pulse">
                    CREDENTIALS COMPROMISED — CHANGE PASSWORDS IMMEDIATELY
                  </div>
                )}
                {breachResults.risk_level === "CLEAN" && (
                  <div style={{ color: "#00aa44", fontSize: "11px", letterSpacing: "2px" }}>
                    NO BREACHES FOUND ACROSS ALL CHECKED DATABASES
                  </div>
                )}
              </div>

              {/* Per-source results */}
              <div style={s.section}>
                <div style={s.title}>SOURCE BY SOURCE RESULTS</div>
                {breachResults.sources?.map((src, i) => (
                  <div key={i} style={{ padding: "10px", marginBottom: "8px",
                    background: "#0d0000", border: "1px solid #330000",
                    borderLeft: `3px solid ${getSourceColor(src.status)}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "#ff2222", fontSize: "11px", fontWeight: "bold" }}>{src.name}</span>
                      <span style={{ fontSize: "10px", fontWeight: "bold",
                        color: getSourceColor(src.status) }}>
                        {src.status === "found" ? `${src.breach_count} BREACHES` :
                         src.status === "clean" ? "CLEAN" :
                         src.status === "no_key" ? "NO KEY" :
                         src.status === "unavailable" ? "UNAVAILABLE" : "ERROR"}
                      </span>
                    </div>

                    {src.note && (
                      <div style={{ fontSize: "10px", color: "#ff8800", marginBottom: "4px" }}>
                        {src.note}
                      </div>
                    )}
                    {src.error && (
                      <div style={{ fontSize: "10px", color: "#552222" }}>{src.error}</div>
                    )}
                    {src.breaches?.length > 0 && (
                      <div style={{ marginTop: "6px" }}>
                        {src.breaches.map((b, j) => (
                          <div key={j} style={{ fontSize: "10px", padding: "3px 6px",
                            marginBottom: "3px", background: "#1a0000",
                            border: "1px solid #330000", color: "#882222" }}>
                            {b.name}
                            {b.date && <span style={{ color: "#440000" }}> — {b.date}</span>}
                            {b.records && <span style={{ color: "#440000" }}> — {b.records?.toLocaleString()} records</span>}
                            {b.data_types?.length > 0 && (
                              <div style={{ marginTop: "3px", display: "flex", flexWrap: "wrap", gap: "3px" }}>
                                {b.data_types.map((dt, k) => (
                                  <span key={k} style={{ padding: "1px 5px", fontSize: "9px",
                                    background: "#0d0000", border: "1px solid #440000", color: "#ff4400" }}>
                                    {dt}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Manual search links */}
              {breachResults.search_links && (
                <div style={s.section}>
                  <div style={s.title}>ADDITIONAL MANUAL CHECKS</div>
                  <div style={{ color: "#552222", fontSize: "10px", marginBottom: "8px" }}>
                    Search these sites manually for deeper breach intelligence:
                  </div>
                  {Object.entries(breachResults.search_links).map(([name, url]) => (
                    <a key={name} href={url} target="_blank" rel="noreferrer"
                      style={{ display: "block", padding: "6px 10px", marginBottom: "4px",
                        background: "#0d0000", border: "1px solid #330000",
                        color: "#ff4400", fontSize: "10px", textDecoration: "none",
                        letterSpacing: "1px" }}>
                      {name.toUpperCase().replace(/_/g, " ")} →
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
