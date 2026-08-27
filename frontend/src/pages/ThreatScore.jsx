import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function ThreatScore() {
  const [inputs, setInputs] = useState({
    vt_malicious: 0,
    abuse_score: 0,
    domain_age_days: 365,
    breach_count: 0,
    has_gps: false,
    sentiment: "NEUTRAL",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = async (overrideInputs = null) => {
    const targetInputs = overrideInputs || inputs;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/recon/threat-score`, targetInputs);
      setResult(res.data.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const presets = [
    {
      label: "Clean IP (Google DNS)",
      vals: { vt_malicious: 0, abuse_score: 0, domain_age_days: 9000, breach_count: 0, has_gps: false, sentiment: "NEUTRAL" }
    },
    {
      label: "Suspicious Domain",
      vals: { vt_malicious: 3, abuse_score: 45, domain_age_days: 5, breach_count: 0, has_gps: false, sentiment: "NEGATIVE" }
    },
    {
      label: "Malicious IP",
      vals: { vt_malicious: 12, abuse_score: 87, domain_age_days: 30, breach_count: 2, has_gps: false, sentiment: "NEGATIVE" }
    },
    {
      label: "Privacy Exposed Photo",
      vals: { vt_malicious: 0, abuse_score: 0, domain_age_days: 365, breach_count: 1, has_gps: true, sentiment: "NEUTRAL" }
    },
  ];

  const s = {
    input: {
      width: "100%", background: "#060000", border: "1px solid #440000",
      borderLeft: "3px solid #ff0000", color: "#ff2222",
      fontFamily: "Courier New", fontSize: "12px", padding: "6px 10px"
    },
    label: { color: "#ff4400", fontSize: "10px", letterSpacing: "1px", marginBottom: "4px", display: "block" }
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* Left — Inputs */}
      <div style={{ width: "300px", display: "flex", flexDirection: "column", gap: "12px",
        padding: "12px", borderRight: "1px solid #440000", background: "#030000", overflowY: "auto" }}>

        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          THREAT SCORE CALCULATOR
        </div>

        <div style={{ color: "#552222", fontSize: "10px", lineHeight: "1.5" }}>
          Enter threat indicators from your investigation to get a unified risk score (0-100).
        </div>

        {/* Presets */}
        <div>
          <div style={{ color: "#882222", fontSize: "10px", marginBottom: "6px" }}>QUICK PRESETS</div>
          {presets.map((p, i) => (
            <button key={i} onClick={() => { setInputs(p.vals); calculate(p.vals); }}
              style={{ width: "100%", padding: "6px 8px", marginBottom: "4px", fontSize: "10px",
                cursor: "pointer", fontFamily: "Courier New", textAlign: "left",
                background: "#060000", border: "1px solid #330000", color: "#552222" }}>
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />

        {/* Inputs */}
        <div>
          <label style={s.label}>VIRUSTOTAL MALICIOUS ENGINES (0-70)</label>
          <input type="number" min="0" max="70" value={inputs.vt_malicious}
            onChange={e => setInputs({ ...inputs, vt_malicious: parseInt(e.target.value) || 0 })}
            style={s.input} />
        </div>

        <div>
          <label style={s.label}>ABUSEIPDB SCORE % (0-100)</label>
          <input type="number" min="0" max="100" value={inputs.abuse_score}
            onChange={e => setInputs({ ...inputs, abuse_score: parseInt(e.target.value) || 0 })}
            style={s.input} />
        </div>

        <div>
          <label style={s.label}>DOMAIN AGE IN DAYS</label>
          <input type="number" min="0" value={inputs.domain_age_days}
            onChange={e => setInputs({ ...inputs, domain_age_days: parseInt(e.target.value) || 0 })}
            style={s.input} />
          <div style={{ fontSize: "9px", color: "#330000", marginTop: "3px" }}>
            Newer domains = higher risk. Under 7 days = critical.
          </div>
        </div>

        <div>
          <label style={s.label}>DATA BREACHES FOUND</label>
          <input type="number" min="0" value={inputs.breach_count}
            onChange={e => setInputs({ ...inputs, breach_count: parseInt(e.target.value) || 0 })}
            style={s.input} />
        </div>

        <div>
          <label style={s.label}>GPS IN IMAGE METADATA</label>
          <select value={inputs.has_gps ? "yes" : "no"}
            onChange={e => setInputs({ ...inputs, has_gps: e.target.value === "yes" })}
            style={{ ...s.input, background: "#060000" }}>
            <option value="no">NO</option>
            <option value="yes">YES — GPS FOUND</option>
          </select>
        </div>

        <div>
          <label style={s.label}>NEWS SENTIMENT</label>
          <select value={inputs.sentiment}
            onChange={e => setInputs({ ...inputs, sentiment: e.target.value })}
            style={{ ...s.input, background: "#060000" }}>
            <option value="NEUTRAL">NEUTRAL</option>
            <option value="NEGATIVE">NEGATIVE</option>
            <option value="POSITIVE">POSITIVE</option>
          </select>
        </div>

        <button onClick={calculate} disabled={loading}
          style={{ width: "100%", padding: "10px", fontSize: "11px", letterSpacing: "2px",
            cursor: "pointer", fontFamily: "Courier New",
            background: "#1a0000", border: "1px solid #ff0000", color: "#ff0000" }}>
          {loading ? "CALCULATING..." : "CALCULATE THREAT SCORE"}
        </button>
      </div>

      {/* Right — Result */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

        {!result && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", color: "#220000" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>[ 0 ]</div>
            <div style={{ fontSize: "13px", letterSpacing: "3px" }}>ENTER INDICATORS AND CALCULATE</div>
            <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
              Combines VirusTotal + AbuseIPDB + Domain Age + Breaches + GPS + Sentiment
            </div>
          </div>
        )}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
            height: "100%", color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
            className="animate-pulse">
            CALCULATING THREAT SCORE...
          </div>
        )}

        {result && !loading && (
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>

            {/* Big Score */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{
                fontSize: "120px", fontWeight: "bold", lineHeight: "1",
                color: result.color, fontFamily: "Courier New",
                textShadow: `0 0 40px ${result.color}44`
              }}>
                {result.score}
              </div>
              <div style={{ fontSize: "32px", color: result.color,
                letterSpacing: "8px", marginTop: "8px" }}>
                {result.level}
              </div>
              <div style={{ fontSize: "11px", color: "#552222",
                marginTop: "12px", letterSpacing: "1px" }}>
                OUT OF 100
              </div>
            </div>

            {/* Score gauge */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ height: "12px", background: "#0d0000",
                border: "1px solid #330000", position: "relative" }}>
                {/* Zone markers */}
                <div style={{ position: "absolute", left: "25%", top: 0, bottom: 0,
                  borderLeft: "1px dashed #330000" }} />
                <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0,
                  borderLeft: "1px dashed #330000" }} />
                <div style={{ position: "absolute", left: "75%", top: 0, bottom: 0,
                  borderLeft: "1px dashed #330000" }} />
                {/* Fill */}
                <div style={{
                  height: "100%", width: `${result.score}%`,
                  background: `linear-gradient(to right, #00aa44, #ff8800, ${result.color})`,
                  transition: "width 1s ease"
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between",
                fontSize: "9px", color: "#330000", marginTop: "4px" }}>
                <span>LOW</span>
                <span>MEDIUM</span>
                <span>HIGH</span>
                <span>CRITICAL</span>
              </div>
            </div>

            {/* Recommendation */}
            <div style={{ padding: "16px", marginBottom: "24px",
              background: "#060000", border: `1px solid ${result.color}`,
              borderLeft: `4px solid ${result.color}` }}>
              <div style={{ color: result.color, fontSize: "10px",
                letterSpacing: "2px", marginBottom: "8px" }}>
                RECOMMENDATION
              </div>
              <div style={{ color: "#882222", fontSize: "12px", lineHeight: "1.6" }}>
                {result.recommendation}
              </div>
            </div>

            {/* Score Breakdown */}
            {result.factors?.length > 0 && (
              <div style={{ padding: "16px", background: "#060000", border: "1px solid #440000" }}>
                <div style={{ color: "#ff0000", fontSize: "11px",
                  letterSpacing: "3px", marginBottom: "12px" }}>
                  SCORE BREAKDOWN
                </div>
                {result.factors.map((factor, i) => {
                  const parts = factor.split("(+");
                  const pts = parts[1] ? parseInt(parts[1]) : 0;
                  return (
                    <div key={i} style={{ marginBottom: "8px", padding: "8px",
                      background: "#0d0000", border: "1px solid #330000" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#882222" }}>{parts[0].trim()}</span>
                        <span style={{ fontSize: "12px", fontWeight: "bold", color: "#ff4400" }}>
                          +{pts}
                        </span>
                      </div>
                      <div style={{ height: "3px", background: "#0d0000", marginTop: "6px" }}>
                        <div style={{ height: "100%", width: `${(pts / 30) * 100}%`,
                          background: "#ff4400" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Zero factors message */}
            {result.factors?.length === 0 && (
              <div style={{ padding: "16px", background: "#060000",
                border: "1px solid #1a3a1a", borderLeft: "4px solid #00aa44" }}>
                <div style={{ color: "#00aa44", fontSize: "11px", letterSpacing: "2px" }}>
                  NO THREAT INDICATORS DETECTED
                </div>
                <div style={{ color: "#336633", fontSize: "11px", marginTop: "6px" }}>
                  All indicators are within safe range. Target appears clean.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
