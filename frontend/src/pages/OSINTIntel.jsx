import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";
const TABS = ["PHONE LOOKUP", "EMAIL INTEL", "DARK WEB"];

export default function OSINTIntel() {
  const [activeTab, setActiveTab] = useState("PHONE LOOKUP");
  const [input, setInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      let res;
      if (activeTab === "PHONE LOOKUP") {
        res = await axios.get(`${API}/osint/phone/${encodeURIComponent(input.trim())}`);
      } else if (activeTab === "EMAIL INTEL") {
        res = await axios.get(`${API}/osint/email/${encodeURIComponent(input.trim())}`);
      } else {
        res = await axios.get(`${API}/osint/darkweb?query=${encodeURIComponent(input.trim())}`);
      }
      setResults(res.data.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  const s = {
    section: { marginBottom: "12px", padding: "12px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" },
    row: { fontSize: "11px", marginBottom: "4px" },
    label: { color: "#ff4400" },
    value: { color: "#882222" },
    link: { color: "#ff4400", fontSize: "11px", textDecoration: "none",
      display: "block", padding: "6px 8px", marginBottom: "4px",
      background: "#0d0000", border: "1px solid #330000" },
    statBox: (color) => ({
      padding: "10px", background: "#0d0000",
      border: `1px solid ${color || "#330000"}`,
      textAlign: "center"
    }),
  };

  const getSpamColor = (level) => {
    if (level === "HIGH") return "#ff0000";
    if (level === "MEDIUM") return "#ff4400";
    return "#00aa44";
  };

  const renderPhone = () => (
    <div>
      {results?.validation && (
        <div style={s.section}>
          <div style={s.title}>PHONE INTELLIGENCE</div>

          {/* Valid/Invalid badge */}
          <div style={{
            marginBottom: "12px", padding: "8px 12px",
            background: results.validation.valid ? "#001a00" : "#1a0000",
            border: `1px solid ${results.validation.valid ? "#00aa44" : "#ff0000"}`,
            color: results.validation.valid ? "#00aa44" : "#ff0000",
            fontSize: "11px", letterSpacing: "2px", display: "flex",
            justifyContent: "space-between", alignItems: "center"
          }}>
            <span>{results.validation.valid ? "✓ VALID NUMBER" : "✗ INVALID NUMBER"}</span>
            {results.validation.type && (
              <span style={{ fontSize: "10px", letterSpacing: "1px", opacity: 0.8 }}>
                {results.validation.type.toUpperCase()}
              </span>
            )}
          </div>

          {/* Main info grid */}
          <div style={s.grid2}>
            {[
              ["NUMBER", results.validation.phone],
              ["CARRIER", results.validation.carrier],
              ["COUNTRY", results.validation.country],
              ["COUNTRY CODE", results.validation.country_code],
              ["REGION", results.validation.location],
              ["LINE TYPE", results.validation.type],
              ["INTL FORMAT", results.validation.format_international],
              ["LOCAL FORMAT", results.validation.format_local],
            ].map(([k, v]) => v && (
              <div key={k} style={s.row}>
                <span style={s.label}>{k}: </span>
                <span style={s.value}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Intelligence */}
      {results?.enhanced && (
        <div style={s.section}>
          <div style={s.title}>ENHANCED INTELLIGENCE</div>

          {/* Stats row */}
          <div style={{ ...s.grid3, marginBottom: "12px" }}>
            {/* Spam Score */}
            <div style={s.statBox(getSpamColor(results.enhanced.spam_level))}>
              <div style={{ fontSize: "9px", color: "#440000", marginBottom: "4px", letterSpacing: "1px" }}>
                SPAM SCORE
              </div>
              <div style={{ fontSize: "20px", fontWeight: "bold",
                color: getSpamColor(results.enhanced.spam_level) }}>
                {results.enhanced.spam_score}%
              </div>
              <div style={{ fontSize: "10px", color: getSpamColor(results.enhanced.spam_level) }}>
                {results.enhanced.spam_level}
              </div>
            </div>

            {/* WhatsApp */}
            <div style={s.statBox(results.enhanced.whatsapp_likely ? "#004400" : "#330000")}>
              <div style={{ fontSize: "9px", color: "#440000", marginBottom: "4px", letterSpacing: "1px" }}>
                WHATSAPP
              </div>
              <div style={{ fontSize: "14px", fontWeight: "bold",
                color: results.enhanced.whatsapp_likely ? "#00aa44" : "#882222" }}>
                {results.enhanced.whatsapp_likely ? "LIKELY" : "UNLIKELY"}
              </div>
              <div style={{ fontSize: "10px", color: "#440000" }}>
                {results.enhanced.sms_capable ? "SMS CAPABLE" : "NO SMS"}
              </div>
            </div>

            {/* Timezone */}
            <div style={s.statBox("#330000")}>
              <div style={{ fontSize: "9px", color: "#440000", marginBottom: "4px", letterSpacing: "1px" }}>
                TIMEZONE
              </div>
              <div style={{ fontSize: "11px", color: "#882222", lineHeight: "1.3" }}>
                {results.enhanced.timezone || "Unknown"}
              </div>
            </div>
          </div>

          {/* Portability */}
          {results.enhanced.ported !== undefined && (
            <div style={{ padding: "8px", marginBottom: "8px",
              background: results.enhanced.ported ? "#1a0800" : "#001a00",
              border: `1px solid ${results.enhanced.ported ? "#ff4400" : "#004400"}` }}>
              <div style={{ fontSize: "11px",
                color: results.enhanced.ported ? "#ff4400" : "#00aa44" }}>
                {results.enhanced.ported
                  ? `NUMBER PORTED — Original carrier: ${results.enhanced.original_carrier}`
                  : `NOT PORTED — Registered carrier matches prefix`}
              </div>
              {results.enhanced.ported_note && (
                <div style={{ fontSize: "10px", color: "#552222", marginTop: "4px" }}>
                  {results.enhanced.ported_note}
                </div>
              )}
            </div>
          )}

          {/* Spam reasons */}
          {results.enhanced.spam_reasons?.length > 0 && (
            <div>
              <div style={{ color: "#ff4400", fontSize: "10px", letterSpacing: "1px", marginBottom: "4px" }}>
                SPAM ANALYSIS:
              </div>
              {results.enhanced.spam_reasons.map((r, i) => (
                <div key={i} style={{ fontSize: "10px", color: "#662222",
                  padding: "3px 6px", marginBottom: "3px",
                  borderLeft: "2px solid #440000" }}>
                  {r}
                </div>
              ))}
            </div>
          )}

          {/* VoIP warning */}
          {results.enhanced.voip_warning && (
            <div style={{ marginTop: "8px", padding: "6px 8px",
              background: "#1a0000", border: "1px solid #ff0000",
              color: "#ff4400", fontSize: "11px" }}>
              ⚠ {results.enhanced.voip_warning}
            </div>
          )}
        </div>
      )}

      {/* Spam report */}
      {results?.spam_report?.found && (
        <div style={{ ...s.section, borderColor: "#ff4400" }}>
          <div style={s.title}>SPAM REPORTS FOUND</div>
          <div style={{ color: "#ff4400", fontSize: "11px", marginBottom: "6px" }}>
            This number has been reported as spam/scam
          </div>
          <a href={results.spam_report.url} target="_blank" rel="noreferrer" style={s.link}>
            VIEW SPAM REPORTS — {results.spam_report.source}
          </a>
        </div>
      )}

      {/* Social search */}
      {results?.social_search && (
        <div style={s.section}>
          <div style={s.title}>SEARCH & IDENTIFY LINKS</div>
          <div style={{ color: "#440000", fontSize: "10px", marginBottom: "8px" }}>
            Click to find the registered name on these platforms
          </div>
          {Object.entries(results.social_search).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noreferrer" style={s.link}>
              {k.toUpperCase().replace(/_/g, " ")}
            </a>
          ))}
          <div style={{ marginTop: "8px", padding: "6px 8px",
            background: "#0d0000", border: "1px solid #220000",
            fontSize: "10px", color: "#440000", lineHeight: "1.5" }}>
            TIP: Truecaller & Sync.me have the largest name databases for Indian numbers.
            SpyDialer works best for US numbers.
          </div>
        </div>
      )}
    </div>
  );

  const renderEmail = () => (
    <div>
      {results?.validation && (
        <div style={s.section}>
          <div style={s.title}>EMAIL VALIDATION</div>
          <div style={{ marginBottom: "8px", padding: "6px 10px",
            background: results.validation.deliverability === "DELIVERABLE" ? "#001a00" : "#1a0000",
            border: `1px solid ${results.validation.deliverability === "DELIVERABLE" ? "#00aa44" : "#ff0000"}`,
            color: results.validation.deliverability === "DELIVERABLE" ? "#00aa44" : "#ff0000",
            fontSize: "11px", letterSpacing: "2px" }}>
            {results.validation.deliverability || "UNKNOWN"}
          </div>
          <div style={s.grid2}>
            {[
              ["EMAIL", results.validation.email],
              ["QUALITY SCORE", results.validation.quality_score],
              ["VALID FORMAT", String(results.validation.is_valid_format)],
              ["FREE EMAIL", String(results.validation.is_free_email)],
              ["DISPOSABLE", String(results.validation.is_disposable_email)],
              ["ROLE EMAIL", String(results.validation.is_role_email)],
              ["MX FOUND", String(results.validation.is_mx_found)],
              ["SMTP VALID", String(results.validation.is_smtp_valid)],
            ].map(([k, v]) => v && (
              <div key={k} style={s.row}>
                <span style={s.label}>{k}: </span>
                <span style={{
                  color: (k === "DISPOSABLE" && v === "true") ||
                         (k === "ROLE EMAIL" && v === "true") ? "#ff4400" : "#882222"
                }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {results?.gravatar?.found && (
        <div style={s.section}>
          <div style={s.title}>GRAVATAR PROFILE FOUND</div>
          <div style={s.grid2}>
            {[
              ["DISPLAY NAME", results.gravatar.display_name],
              ["USERNAME", results.gravatar.username],
              ["LOCATION", results.gravatar.location],
            ].map(([k, v]) => v && (
              <div key={k} style={s.row}>
                <span style={s.label}>{k}: </span>
                <span style={s.value}>{String(v)}</span>
              </div>
            ))}
          </div>
          {results.gravatar.about && (
            <div style={{ ...s.row, marginTop: "6px" }}>
              <span style={s.label}>ABOUT: </span>
              <span style={s.value}>{results.gravatar.about}</span>
            </div>
          )}
          {results.gravatar.accounts?.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <div style={{ color: "#ff4400", fontSize: "10px", marginBottom: "4px" }}>LINKED ACCOUNTS:</div>
              {results.gravatar.accounts.map((a, i) => (
                <div key={i} style={s.row}>
                  <span style={s.label}>{a.domain}: </span>
                  <span style={s.value}>{a.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {results?.breaches && (
        <div style={s.section}>
          <div style={s.title}>BREACH CHECK</div>
          <div style={{ color: results.breaches.found > 0 ? "#ff0000" : "#00aa44",
            fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>
            {results.breaches.found > 0
              ? `FOUND IN ${results.breaches.found} BREACHES`
              : "NOT FOUND IN KNOWN BREACHES"}
          </div>
          {results.breaches.sources?.map((s2, i) => (
            <div key={i} style={{ padding: "4px 8px", marginBottom: "4px",
              background: "#1a0000", border: "1px solid #330000",
              fontSize: "11px", color: "#ff4400" }}>
              {typeof s2 === "string" ? s2 : s2?.name || JSON.stringify(s2)}
            </div>
          ))}
        </div>
      )}

      {results?.social_search && (
        <div style={s.section}>
          <div style={s.title}>SOCIAL SEARCH LINKS</div>
          {Object.entries(results.social_search).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noreferrer" style={s.link}>
              {k.toUpperCase().replace(/_/g, " ")}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  const renderDarkWeb = () => (
    <div>
      {results?.leakcheck && (
        <div style={s.section}>
          <div style={s.title}>LEAK CHECK</div>
          <div style={{ color: results.leakcheck.found > 0 ? "#ff0000" : "#00aa44",
            fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>
            {results.leakcheck.found > 0
              ? `FOUND IN ${results.leakcheck.found} LEAKS`
              : "NOT FOUND IN KNOWN LEAKS"}
          </div>
          {results.leakcheck.sources?.map((s2, i) => (
            <div key={i} style={{ padding: "4px 8px", marginBottom: "4px",
              background: "#1a0000", border: "1px solid #330000",
              fontSize: "11px", color: "#ff4400" }}>
              {typeof s2 === "string" ? s2 : s2?.name ? `${s2.name} ${s2.date ? `(${s2.date})` : ""}` : JSON.stringify(s2)}
            </div>
          ))}
        </div>
      )}

      {results?.intelx && (
        <div style={s.section}>
          <div style={s.title}>INTELLIGENCE X RESULTS</div>
          <div style={s.row}>
            <span style={s.label}>TOTAL FOUND: </span>
            <span style={{ color: results.intelx.total > 0 ? "#ff0000" : "#00aa44" }}>
              {results.intelx.total}
            </span>
          </div>
          {results.intelx.records?.map((r, i) => (
            <div key={i} style={{ padding: "6px 8px", marginBottom: "4px",
              background: "#0d0000", border: "1px solid #330000" }}>
              <div style={{ color: "#ff4400", fontSize: "11px" }}>{r.name}</div>
              <div style={{ color: "#440000", fontSize: "10px" }}>{r.bucket} — {r.date}</div>
            </div>
          ))}
        </div>
      )}

      {results?.threat_intel && (
        <div style={s.section}>
          <div style={s.title}>THREAT INTEL LINKS</div>
          {Object.entries(results.threat_intel).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noreferrer" style={s.link}>
              {k.toUpperCase().replace(/_/g, " ")}
            </a>
          ))}
        </div>
      )}

      {results?.onion_search && (
        <div style={s.section}>
          <div style={s.title}>TOR / DARK WEB SEARCH</div>
          <div style={{ color: "#440000", fontSize: "10px", marginBottom: "8px" }}>
            {results.onion_search.note}
          </div>
          <a href={results.onion_search.ahmia} target="_blank" rel="noreferrer" style={s.link}>
            AHMIA — TOR SEARCH ENGINE
          </a>
        </div>
      )}

      {results?.urlhaus && (
        <div style={{ ...s.section, borderColor: "#ff0000" }}>
          <div style={s.title}>URLHAUS MALWARE CHECK</div>
          <div style={s.grid2}>
            {[
              ["STATUS", results.urlhaus.status],
              ["THREAT", results.urlhaus.threat],
              ["URL STATUS", results.urlhaus.url_status],
            ].map(([k, v]) => v && (
              <div key={k} style={s.row}>
                <span style={s.label}>{k}: </span>
                <span style={{ color: "#ff0000" }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>
      <div style={{ width: "260px", display: "flex", flexDirection: "column",
        gap: "12px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", overflowY: "auto" }}>

        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          OSINT INTELLIGENCE
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

        <div style={{ borderTop: "1px solid #220000" }} />

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px" }}>
            {activeTab === "PHONE LOOKUP" ? "PHONE NUMBER" :
             activeTab === "EMAIL INTEL" ? "EMAIL ADDRESS" : "QUERY / DOMAIN / EMAIL"}
          </div>
          <input
            type="text"
            placeholder={
              activeTab === "PHONE LOOKUP" ? "+91 9876543210" :
              activeTab === "EMAIL INTEL" ? "example@email.com" :
              "domain.com / email / username"
            }
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
          <button onClick={handleSearch} disabled={loading || !input.trim()}
            style={{
              width: "100%", padding: "8px", marginTop: "6px",
              fontSize: "11px", cursor: "pointer", fontFamily: "Courier New",
              background: "#1a0000", border: "1px solid #ff0000", color: "#ff0000",
            }}>
            {loading ? "SCANNING..." : "INVESTIGATE"}
          </button>
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />
        <div style={{ color: "#882222", fontSize: "11px" }}>QUICK TESTS</div>
        {[
          { label: "+91 9876543210", action: () => { setActiveTab("PHONE LOOKUP"); setInput("+919876543210"); }},
          { label: "test@gmail.com", action: () => { setActiveTab("EMAIL INTEL"); setInput("test@gmail.com"); }},
          { label: "Dark: google.com", action: () => { setActiveTab("DARK WEB"); setInput("google.com"); }},
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

        <div style={{ padding: "8px", background: "#0d0000",
          border: "1px solid #330000", fontSize: "10px", color: "#440000", lineHeight: "1.5" }}>
          Note: Registered name requires Truecaller/Sync.me — click the search links to find it.
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #330000",
          background: "#060000", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>{activeTab}</div>
          {results && <div style={{ color: "#440000", fontSize: "11px" }}>SCAN COMPLETE</div>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {!results && !loading && !error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", color: "#220000" }}>
              <div style={{ fontSize: "48px", color: "#1a0000", marginBottom: "16px" }}>[ O ]</div>
              <div style={{ fontSize: "13px", letterSpacing: "3px" }}>ENTER TARGET TO INVESTIGATE</div>
              <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
                Phone / Email / Dark Web Intelligence
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "12px" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
                className="animate-pulse">
                SCANNING INTELLIGENCE DATABASES...
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px", border: "1px solid #ff0000", background: "#0d0000" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", marginBottom: "4px" }}>ERROR</div>
              <div style={{ color: "#882222", fontSize: "11px" }}>{error}</div>
            </div>
          )}

          {!loading && results && (
            activeTab === "PHONE LOOKUP" ? renderPhone() :
            activeTab === "EMAIL INTEL" ? renderEmail() :
            renderDarkWeb()
          )}
        </div>
      </div>
    </div>
  );
}
