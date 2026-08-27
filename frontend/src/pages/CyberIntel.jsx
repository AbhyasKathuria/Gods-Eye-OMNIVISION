import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const TABS = ["IP TRACKER", "DOMAIN INTEL", "BREACH CHECK", "SHODAN", "VIRUSTOTAL", "ALIENVAULT OTX"];

export default function CyberIntel() {
  const [activeTab, setActiveTab] = useState("IP TRACKER");
  const [input, setInput] = useState("");
  const [scanType, setScanType] = useState("url");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (overrideInput = null, overrideTab = null) => {
    const targetInput = (typeof overrideInput === "string") ? overrideInput : input;
    const targetTab = (typeof overrideTab === "string") ? overrideTab : activeTab;

    if (!targetInput.trim()) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      let res;
      const cleanInput = targetInput.trim();
      switch (targetTab) {
        case "IP TRACKER":
          res = await axios.get(`${API}/cyber/ip/${cleanInput}`);
          break;
        case "DOMAIN INTEL":
          res = await axios.get(`${API}/cyber/domain/${cleanInput}`);
          break;
        case "BREACH CHECK":
          res = await axios.get(`${API}/cyber/breach/${cleanInput}`);
          break;
        case "SHODAN":
          res = await axios.get(`${API}/cyber/shodan?query=${encodeURIComponent(cleanInput)}`);
          break;
        case "VIRUSTOTAL":
          res = await axios.get(`${API}/cyber/virustotal?target=${encodeURIComponent(cleanInput)}&scan_type=${scanType}`);
          break;
        case "ALIENVAULT OTX": {
          const isIP = cleanInput.includes(".") && !isNaN(cleanInput.split(".")[0]);
          const indType = isIP ? "ip" : "domain";
          res = await axios.get(`${API}/cyber/otx/${indType}/${cleanInput}`);
          break;
        }
        default:
          break;
      }
      setResults(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  const placeholders = {
    "IP TRACKER": "Enter IP address e.g. 8.8.8.8",
    "DOMAIN INTEL": "Enter domain e.g. google.com",
    "BREACH CHECK": "Enter email address",
    "SHODAN": "Enter search query e.g. apache port:80",
    "VIRUSTOTAL": "Enter URL, IP or domain",
    "ALIENVAULT OTX": "Enter IP or domain e.g. 8.8.8.8 or google.com",
  };

  const s = {
    section: { marginBottom: "16px", padding: "12px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
    row: { fontSize: "11px", marginBottom: "4px" },
    label: { color: "#ff4400" },
    value: { color: "#882222" },
    badge: (color) => ({
      display: "inline-block", padding: "2px 8px", fontSize: "10px",
      background: color === "red" ? "#1a0000" : "#0a0a00",
      border: `1px solid ${color === "red" ? "#ff0000" : "#444400"}`,
      color: color === "red" ? "#ff0000" : "#888800",
      marginRight: "4px", marginBottom: "4px"
    })
  };

  const renderIPResults = (data) => {
    const geo = data?.data?.geolocation;
    const abuse = data?.data?.abuse;
    const vt = data?.data?.virustotal;

    return (
      <div>
        {geo && (
          <div style={s.section}>
            <div style={s.title}>GEOLOCATION INTELLIGENCE</div>
            <div style={s.grid2}>
              {[
                ["IP", geo.ip],
                ["COUNTRY", geo.country],
                ["CITY", geo.city],
                ["REGION", geo.region],
                ["ISP", geo.isp],
                ["ORG", geo.org],
                ["TIMEZONE", geo.timezone],
                ["LATITUDE", geo.latitude],
                ["LONGITUDE", geo.longitude],
                ["IS PROXY", String(geo.is_proxy)],
                ["IS TOR", String(geo.is_tor)],
                ["THREAT SCORE", geo.threat_score],
              ].map(([k, v]) => v && (
                <div key={k} style={s.row}>
                  <span style={s.label}>{k}: </span>
                  <span style={s.value}>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {abuse && (
          <div style={s.section}>
            <div style={s.title}>ABUSE INTELLIGENCE</div>
            <div style={s.grid2}>
              {[
                ["ABUSE SCORE", `${abuse.abuse_score}%`],
                ["TOTAL REPORTS", abuse.total_reports],
                ["LAST REPORTED", abuse.last_reported],
                ["WHITELISTED", String(abuse.is_whitelisted)],
                ["USAGE TYPE", abuse.usage_type],
                ["DOMAIN", abuse.domain],
              ].map(([k, v]) => v && (
                <div key={k} style={s.row}>
                  <span style={s.label}>{k}: </span>
                  <span style={{
                    color: k === "ABUSE SCORE" && parseInt(v) > 50 ? "#ff0000" : "#882222"
                  }}>{String(v)}</span>
                </div>
              ))}
            </div>
            {abuse.abuse_score > 50 && (
              <div style={{ color: "#ff0000", fontSize: "11px", marginTop: "8px",
                letterSpacing: "2px" }} className="animate-pulse">
                HIGH RISK IP DETECTED
              </div>
            )}
          </div>
        )}

        {vt && !vt.error && (
          <div style={s.section}>
            <div style={s.title}>VIRUSTOTAL SCAN</div>
            <div style={s.grid2}>
              <div style={s.row}>
                <span style={s.label}>MALICIOUS: </span>
                <span style={{ color: vt.malicious > 0 ? "#ff0000" : "#882222" }}>
                  {vt.malicious}
                </span>
              </div>
              <div style={s.row}>
                <span style={s.label}>SUSPICIOUS: </span>
                <span style={{ color: vt.suspicious > 0 ? "#ff4400" : "#882222" }}>
                  {vt.suspicious}
                </span>
              </div>
              <div style={s.row}>
                <span style={s.label}>HARMLESS: </span>
                <span style={s.value}>{vt.harmless}</span>
              </div>
              <div style={s.row}>
                <span style={s.label}>REPUTATION: </span>
                <span style={s.value}>{vt.reputation}</span>
              </div>
            </div>
          </div>
        )}

        {data?.ai_report && (
          <div style={{ ...s.section, borderColor: "#ff0000" }}>
            <div style={s.title}>AI THREAT ASSESSMENT</div>
            <pre style={{ color: "#882222", fontSize: "11px",
              whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.6" }}>
              {data.ai_report}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderDomainResults = (data) => {
    const whois = data?.data?.whois;
    const dns = data?.data?.dns;
    const vt = data?.data?.virustotal;
    const urlscan = data?.data?.urlscan;
    const urlhaus = data?.data?.urlhaus;

    return (
      <div>
        {whois && (
          <div style={s.section}>
            <div style={s.title}>WHOIS INTELLIGENCE</div>
            <div style={s.grid2}>
              {[
                ["DOMAIN", whois.domain],
                ["REGISTRAR", whois.registrar],
                ["CREATED", whois.created],
                ["EXPIRES", whois.expires],
                ["UPDATED", whois.updated],
                ["STATUS", whois.status],
                ["REGISTRANT", whois.registrant],
                ["COUNTRY", whois.country],
              ].map(([k, v]) => v && (
                <div key={k} style={s.row}>
                  <span style={s.label}>{k}: </span>
                  <span style={s.value}>{String(v).slice(0, 50)}</span>
                </div>
              ))}
            </div>
            {whois.name_servers?.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ ...s.row, color: "#ff4400" }}>NAME SERVERS:</div>
                {whois.name_servers.slice(0, 4).map((ns, i) => (
                  <div key={i} style={{ ...s.row, color: "#662222", paddingLeft: "8px" }}>{ns}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {dns && (
          <div style={s.section}>
            <div style={s.title}>DNS RECORDS</div>
            {dns.a_records?.map((ip, i) => (
              <div key={i} style={s.row}>
                <span style={s.label}>A RECORD: </span>
                <span style={s.value}>{ip}</span>
              </div>
            ))}
            <div style={s.row}>
              <span style={s.label}>DNSSEC: </span>
              <span style={s.value}>{String(dns.authenticated)}</span>
            </div>
          </div>
        )}

        {urlhaus && (
          <div style={s.section}>
            <div style={s.title}>URLHAUS MALWARE INTELLIGENCE</div>
            <div style={s.grid2}>
              {[
                ["QUERY STATUS", urlhaus.status],
                ["MALWARE URL COUNT", urlhaus.url_count],
                ["SPAMHAUS DBL", urlhaus.spamhaus_dbl],
                ["SURBL STATUS", urlhaus.surbl],
              ].map(([k, v]) => v && (
                <div key={k} style={s.row}>
                  <span style={s.label}>{k}: </span>
                  <span style={{
                    color: k === "MALWARE URL COUNT" && parseInt(v) > 0 ? "#ff0000" : "#882222"
                  }}>{String(v)}</span>
                </div>
              ))}
            </div>
            {urlhaus.url_count > 0 && (
              <div style={{ color: "#ff0000", fontSize: "11px", marginTop: "8px",
                letterSpacing: "2px" }} className="animate-pulse">
                ACTIVE MALWARE HOST SPOTTED
              </div>
            )}
            {urlhaus.urlhaus_reference && (
              <div style={{ marginTop: "6px" }}>
                <a href={urlhaus.urlhaus_reference} target="_blank" rel="noreferrer"
                  style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none" }}>
                  VIEW URLHAUS REFERENCE RECORD
                </a>
              </div>
            )}
          </div>
        )}

        {urlscan && (
          <div style={s.section}>
            <div style={s.title}>URLSCAN.IO SCAN</div>
            <div style={s.row}>
              <span style={s.label}>SCAN ID: </span>
              <span style={s.value}>{urlscan.scan_id}</span>
            </div>
            {urlscan.result_url && (
              <a href={urlscan.result_url} target="_blank" rel="noreferrer"
                style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none" }}>
                VIEW FULL SCAN REPORT
              </a>
            )}
          </div>
        )}

        {vt && !vt.error && (
          <div style={s.section}>
            <div style={s.title}>VIRUSTOTAL SCAN</div>
            <div style={s.grid2}>
              <div style={s.row}>
                <span style={s.label}>MALICIOUS: </span>
                <span style={{ color: vt.malicious > 0 ? "#ff0000" : "#882222" }}>
                  {vt.malicious}
                </span>
              </div>
              <div style={s.row}>
                <span style={s.label}>SUSPICIOUS: </span>
                <span style={{ color: vt.suspicious > 0 ? "#ff4400" : "#882222" }}>
                  {vt.suspicious}
                </span>
              </div>
              <div style={s.row}>
                <span style={s.label}>HARMLESS: </span>
                <span style={s.value}>{vt.harmless}</span>
              </div>
              <div style={s.row}>
                <span style={s.label}>REPUTATION: </span>
                <span style={s.value}>{vt.reputation}</span>
              </div>
            </div>
            {vt.tags?.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                {vt.tags.map((tag, i) => (
                  <span key={i} style={s.badge("yellow")}>{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {data?.ai_report && (
          <div style={{ ...s.section, borderColor: "#ff0000" }}>
            <div style={s.title}>AI THREAT ASSESSMENT</div>
            <pre style={{ color: "#882222", fontSize: "11px",
              whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.6" }}>
              {data.ai_report}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderBreachResults = (data) => {
    const breach = data?.data;
    return (
      <div>
        <div style={s.section}>
          <div style={s.title}>BREACH INTELLIGENCE</div>
          <div style={s.row}>
            <span style={s.label}>EMAIL: </span>
            <span style={s.value}>{data?.email}</span>
          </div>
          <div style={s.row}>
            <span style={s.label}>BREACHES FOUND: </span>
            <span style={{ color: breach?.found > 0 ? "#ff0000" : "#882222" }}>
              {breach?.found || 0}
            </span>
          </div>
          {breach?.found > 0 && (
            <div style={{ color: "#ff0000", fontSize: "11px", marginTop: "8px",
              letterSpacing: "2px" }} className="animate-pulse">
              CREDENTIALS COMPROMISED
            </div>
          )}
        </div>

        {breach?.sources?.length > 0 && (
          <div style={s.section}>
            <div style={s.title}>BREACH SOURCES ({breach.sources.length})</div>
            {breach.sources.map((source, i) => (
              <div key={i} style={{ padding: "8px", marginBottom: "6px",
                border: "1px solid #330000", background: "#0d0000" }}>
                <div style={{ color: "#ff4400", fontSize: "11px" }}>
                  {typeof source === "string" ? source : source.name || JSON.stringify(source)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderShodanResults = (data) => {
    const shodan = data?.data;
    return (
      <div>
        <div style={s.section}>
          <div style={s.title}>SHODAN RESULTS — {shodan?.total} DEVICES FOUND</div>
        </div>
        {shodan?.results?.map((device, i) => (
          <div key={i} style={{ ...s.section, marginBottom: "8px" }}>
            <div style={{ color: "#ff4400", fontSize: "11px", marginBottom: "6px" }}>
              DEVICE {i + 1}
            </div>
            <div style={s.grid2}>
              {[
                ["IP", device.ip],
                ["PORT", device.port],
                ["ORG", device.org],
                ["COUNTRY", device.country],
                ["CITY", device.city],
                ["OS", device.os],
                ["PRODUCT", device.product],
                ["VERSION", device.version],
              ].map(([k, v]) => v && (
                <div key={k} style={s.row}>
                  <span style={s.label}>{k}: </span>
                  <span style={s.value}>{String(v)}</span>
                </div>
              ))}
            </div>
            {device.hostnames?.length > 0 && (
              <div style={{ marginTop: "4px" }}>
                <span style={s.label}>HOSTNAMES: </span>
                <span style={s.value}>{device.hostnames.join(", ")}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderVTResults = (data) => {
    const vt = data?.data;
    return (
      <div>
        {vt?.error ? (
          <div style={s.section}>
            <div style={{ ...s.title, color: "#882222" }}>VIRUSTOTAL ERROR</div>
            <div style={{ color: "#552222", fontSize: "11px" }}>{vt.error}</div>
          </div>
        ) : (
          <div style={s.section}>
            <div style={s.title}>VIRUSTOTAL ANALYSIS</div>
            <div style={s.grid2}>
              <div style={s.row}>
                <span style={s.label}>MALICIOUS: </span>
                <span style={{ color: vt?.malicious > 0 ? "#ff0000" : "#882222" }}>
                  {vt?.malicious}
                </span>
              </div>
              <div style={s.row}>
                <span style={s.label}>SUSPICIOUS: </span>
                <span style={{ color: vt?.suspicious > 0 ? "#ff4400" : "#882222" }}>
                  {vt?.suspicious}
                </span>
              </div>
              <div style={s.row}>
                <span style={s.label}>HARMLESS: </span>
                <span style={s.value}>{vt?.harmless}</span>
              </div>
              <div style={s.row}>
                <span style={s.label}>UNDETECTED: </span>
                <span style={s.value}>{vt?.undetected}</span>
              </div>
              <div style={s.row}>
                <span style={s.label}>REPUTATION: </span>
                <span style={s.value}>{vt?.reputation}</span>
              </div>
            </div>
            {vt?.tags?.length > 0 && (
              <div style={{ marginTop: "8px" }}>
                <div style={{ ...s.row, color: "#ff4400", marginBottom: "4px" }}>TAGS:</div>
                {vt.tags.map((tag, i) => (
                  <span key={i} style={s.badge("yellow")}>{tag}</span>
                ))}
              </div>
            )}
            {vt?.malicious > 0 && (
              <div style={{ marginTop: "8px", color: "#ff0000",
                fontSize: "11px", letterSpacing: "2px" }} className="animate-pulse">
                THREAT DETECTED — MALICIOUS TARGET
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderOTXResults = (data) => {
    const pulses = data?.pulses || [];

    return (
      <div>
        <div style={s.section}>
          <div style={s.title}>ALIENVAULT OTX SUMMARY</div>
          <div style={s.grid2}>
            <div style={s.row}><span style={s.label}>INDICATOR: </span><span style={s.value}>{data.indicator}</span></div>
            <div style={s.row}><span style={s.label}>TYPE: </span><span style={s.value}>{data.type?.toUpperCase()}</span></div>
            <div style={s.row}><span style={s.label}>PULSE COUNT: </span><span style={s.value}>{data.pulse_count}</span></div>
            <div style={s.row}>
              <span style={s.label}>REPUTATION: </span>
              <span style={s.badge(data.reputation === "MALICIOUS" ? "red" : "yellow")}>{data.reputation}</span>
            </div>
          </div>
        </div>

        {pulses.length > 0 && (
          <div style={s.section}>
            <div style={s.title}>THREAT PULSES DETECTED ({pulses.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
              {pulses.map((p, i) => (
                <div key={i} style={{ borderBottom: "1px solid #220000", paddingBottom: "10px" }}>
                  <div style={{ color: "#ff2222", fontSize: "11px", fontWeight: "bold" }}>{p.name}</div>
                  <div style={{ color: "#666", fontSize: "9px", marginTop: "2px" }}>
                    Author: {p.author} | Created: {p.created ? new Date(p.created).toLocaleDateString() : "N/A"}
                  </div>
                  <div style={{ color: "#aaa", fontSize: "10px", marginTop: "4px", lineHeight: "1.4" }}>
                    {p.description || "No description available."}
                  </div>
                  {p.tags && p.tags.length > 0 && (
                    <div style={{ marginTop: "6px" }}>
                      {p.tags.map((t, idx) => (
                        <span key={idx} style={{
                          display: "inline-block", padding: "1px 6px", fontSize: "8px",
                          background: "#0c0606", border: "1px solid #ff4444", color: "#ff4444", marginRight: "4px"
                        }}>{t}</span>
                      ))}
                    </div>
                  )}
                  {p.references && p.references.length > 0 && (
                    <div style={{ marginTop: "6px", fontSize: "9px" }}>
                      <span style={{ color: "#ff4400" }}>References: </span>
                      {p.references.map((r, idx) => (
                        <a key={idx} href={r} target="_blank" rel="noreferrer" style={{ color: "#882222", marginRight: "8px", textDecoration: "underline" }}>
                          Link {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;
    switch (activeTab) {
      case "IP TRACKER": return renderIPResults(results);
      case "DOMAIN INTEL": return renderDomainResults(results);
      case "BREACH CHECK": return renderBreachResults(results);
      case "SHODAN": return renderShodanResults(results);
      case "VIRUSTOTAL": return renderVTResults(results);
      case "ALIENVAULT OTX": return renderOTXResults(results);
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* Left Panel */}
      <div style={{
        width: "280px", display: "flex", flexDirection: "column",
        gap: "12px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", overflowY: "auto"
      }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          CYBER INTELLIGENCE
        </div>

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            SELECT MODULE
          </div>
          {TABS.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setResults(null); setInput(""); }}
              style={{
                width: "100%", padding: "8px", marginBottom: "4px",
                fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
                fontFamily: "Courier New", textAlign: "left",
                background: activeTab === tab ? "#1a0000" : "#060000",
                border: `1px solid ${activeTab === tab ? "#ff0000" : "#330000"}`,
                color: activeTab === tab ? "#ff0000" : "#552222",
              }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            TARGET INPUT
          </div>

          {activeTab === "VIRUSTOTAL" && (
            <select
              value={scanType}
              onChange={e => setScanType(e.target.value)}
              style={{
                width: "100%", marginBottom: "6px", padding: "6px",
                background: "#060000", border: "1px solid #440000",
                color: "#882222", fontFamily: "Courier New", fontSize: "11px"
              }}>
              <option value="url">URL</option>
              <option value="ip">IP</option>
              <option value="domain">DOMAIN</option>
            </select>
          )}

          <input
            type="text"
            placeholder={placeholders[activeTab]}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{
              width: "100%", background: "#060000",
              border: "1px solid #440000", borderLeft: "3px solid #ff0000",
              color: "#ff2222", fontFamily: "Courier New",
              fontSize: "11px", padding: "8px 12px"
            }}
          />

          <button onClick={handleSearch} disabled={!input.trim() || loading}
            style={{
              width: "100%", padding: "8px", marginTop: "6px",
              fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
              fontFamily: "Courier New",
              background: input ? "#1a0000" : "#060000",
              border: `1px solid ${input ? "#ff0000" : "#440000"}`,
              color: input ? "#ff0000" : "#662222",
            }}>
            {loading ? "SCANNING..." : `SCAN ${activeTab.split(" ")[0]}`}
          </button>
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />
        <div style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px" }}>
          QUICK TESTS
        </div>
        {[
          { label: "[IP] Google DNS 8.8.8.8", action: () => { setActiveTab("IP TRACKER"); setInput("8.8.8.8"); handleSearch("8.8.8.8", "IP TRACKER"); }},
          { label: "[DOMAIN] Google.com Info", action: () => { setActiveTab("DOMAIN INTEL"); setInput("google.com"); handleSearch("google.com", "DOMAIN INTEL"); }},
          { label: "[BREACH] admin@gmail.com Check", action: () => { setActiveTab("BREACH CHECK"); setInput("admin@gmail.com"); handleSearch("admin@gmail.com", "BREACH CHECK"); }},
          { label: "[SHODAN] webcam port:80", action: () => { setActiveTab("SHODAN"); setInput("webcam port:80"); handleSearch("webcam port:80", "SHODAN"); }},
          { label: "[VIRUSTOTAL] google.com Scan", action: () => { setActiveTab("VIRUSTOTAL"); setScanType("domain"); setInput("google.com"); handleSearch("google.com", "VIRUSTOTAL"); }},
          { label: "[ALIENVAULT] Cloudflare 1.1.1.1", action: () => { setActiveTab("ALIENVAULT OTX"); setInput("1.1.1.1"); handleSearch("1.1.1.1", "ALIENVAULT OTX"); }},
        ].map((t, i) => (
          <button key={i} onClick={t.action}
            style={{
              width: "100%", padding: "6px 8px", marginBottom: "4px",
              fontSize: "11px", cursor: "pointer", fontFamily: "Courier New",
              textAlign: "left", background: "#060000",
              border: "1px solid #330000", color: "#552222",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid #330000",
          background: "#060000", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>
            {activeTab}
          </div>
          {results && (
            <div style={{ color: "#440000", fontSize: "11px" }}>
              SCAN COMPLETE
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

          {!results && !loading && !error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", color: "#220000" }}>
              <div style={{ fontSize: "48px", color: "#1a0000", marginBottom: "16px" }}>[ # ]</div>
              <div style={{ fontSize: "13px", letterSpacing: "3px" }}>SELECT MODULE AND ENTER TARGET</div>
              <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
                IP / Domain / Email / Query
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "12px" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
                className="animate-pulse">
                SCANNING TARGET...
              </div>
              <div style={{ color: "#440000", fontSize: "11px" }}>
                Querying intelligence databases
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px", border: "1px solid #ff0000", background: "#0d0000" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", marginBottom: "4px" }}>
                SCAN ERROR
              </div>
              <div style={{ color: "#882222", fontSize: "11px" }}>{error}</div>
            </div>
          )}

          {!loading && renderResults()}
        </div>
      </div>
    </div>
  );
}
