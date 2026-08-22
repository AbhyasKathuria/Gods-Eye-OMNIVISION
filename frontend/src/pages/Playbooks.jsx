import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

const PLAYBOOKS = [
  {
    id: "person_osint",
    title: "PERSON INVESTIGATION",
    icon: "[ P ]",
    description: "Full OSINT profile on any individual using public sources",
    steps: [
      { label: "Search news mentions", module: "identity", action: "Person Search — NewsAPI + Reddit" },
      { label: "Check username on 30+ platforms", module: "recon", action: "Username Recon — Platform scan" },
      { label: "Scan for email breaches", module: "recon", action: "Breach Check — LeakCheck + BreachDirectory" },
      { label: "Search social media", module: "news", action: "Reddit Search — Public posts" },
      { label: "Build intelligence graph", module: "graph", action: "Intel Graph — PERSON type" },
      { label: "Generate AI OSINT report", module: "identity", action: "AI Report — Full profile" },
    ],
    color: "#ff0000",
    usecase: "Use when investigating a person's public digital footprint for research or security purposes.",
    example: "Target: John Doe → Finds LinkedIn, GitHub, Reddit accounts. 2 breach records. News mentions. Full AI report."
  },
  {
    id: "ip_threat",
    title: "IP THREAT ANALYSIS",
    icon: "[ IP ]",
    description: "Complete threat assessment for any IP address",
    steps: [
      { label: "Geolocate the IP", module: "cyber", action: "IP Tracker — Location + ISP" },
      { label: "Check abuse history", module: "cyber", action: "AbuseIPDB — Abuse score + reports" },
      { label: "Scan with VirusTotal", module: "cyber", action: "VirusTotal — 70+ engine scan" },
      { label: "Search Shodan devices", module: "cyber", action: "Shodan — Open ports + services" },
      { label: "Build threat graph", module: "graph", action: "Intel Graph — IP type" },
      { label: "Calculate threat score", module: "threat", action: "Threat Score — 0-100 risk rating" },
      { label: "Generate threat report", module: "ai", action: "Auto Investigation — IP type" },
    ],
    color: "#ff4400",
    usecase: "Use when analyzing a suspicious IP from logs, failed logins, or reported attacks.",
    example: "Target: 185.x.x.x → AbuseIPDB: 92%, VT: 15 malicious, Shodan: SSH on port 22, Threat Score: 87 CRITICAL"
  },
  {
    id: "domain_recon",
    title: "DOMAIN RECONNAISSANCE",
    icon: "[ D ]",
    description: "Full investigation of any website or domain",
    steps: [
      { label: "Run WHOIS lookup", module: "cyber", action: "Domain Investigator — WHOIS + DNS" },
      { label: "Scan with VirusTotal", module: "cyber", action: "VirusTotal — Domain threat scan" },
      { label: "URLScan analysis", module: "cyber", action: "URLScan.io — Live website scan" },
      { label: "Check domain age", module: "threat", action: "Threat Score — Domain age factor" },
      { label: "Search news mentions", module: "news", action: "News Search — Domain mentions" },
      { label: "Build domain graph", module: "graph", action: "Intel Graph — DOMAIN type" },
      { label: "Generate domain report", module: "ai", action: "Auto Investigation — DOMAIN type" },
    ],
    color: "#ff8800",
    usecase: "Use when verifying if a website is legitimate or investigating a suspicious domain.",
    example: "Target: suspicious-bank.xyz → Registered yesterday, Panama. VT: 7 malicious. URLScan: phishing kit detected."
  },
  {
    id: "email_breach",
    title: "EMAIL BREACH INVESTIGATION",
    icon: "[ @ ]",
    description: "Check if an email address has been compromised",
    steps: [
      { label: "Check LeakCheck.io", module: "recon", action: "Breach Check — LeakCheck.io (Source 1)" },
      { label: "Check BreachDirectory", module: "recon", action: "Breach Check — BreachDirectory (Source 2)" },
      { label: "Extract domain from email", module: "cyber", action: "Domain Investigator — Email domain" },
      { label: "Search username variants", module: "recon", action: "Username Recon — Email prefix" },
      { label: "Build email graph", module: "graph", action: "Intel Graph — EMAIL type" },
      { label: "Calculate exposure score", module: "threat", action: "Threat Score — Breach count factor" },
    ],
    color: "#ffaa00",
    usecase: "Use when checking if credentials have been exposed in data breaches.",
    example: "Target: user@gmail.com → Found in 3 breaches: LinkedIn 2021, Adobe 2013, Collection #1. Risk: MEDIUM"
  },
  {
    id: "image_forensics",
    title: "IMAGE FORENSICS",
    icon: "[ IMG ]",
    description: "Extract intelligence from any uploaded image",
    steps: [
      { label: "Extract EXIF metadata", module: "visual", action: "Visual Intel — EXIF extraction" },
      { label: "Check for GPS coordinates", module: "visual", action: "Visual Intel — GPS extraction" },
      { label: "Run reverse image search", module: "visual", action: "Visual Intel — SauceNAO search" },
      { label: "Face analysis (if person)", module: "identity", action: "Identity Engine — Face scan" },
      { label: "Check AI generation", module: "identity", action: "Identity Engine — Deepfake warning check" },
      { label: "Calculate exposure risk", module: "threat", action: "Threat Score — GPS exposure factor" },
    ],
    color: "#ff6600",
    usecase: "Use when analyzing an image for hidden metadata, location data, or identity information.",
    example: "Target: photo.jpg → GPS: 28.6139N 77.2090E (New Delhi). Device: iPhone 14. Timestamp: 2024-03-15. Risk: HIGH"
  },
  {
    id: "cyber_threat_hunt",
    title: "CYBER THREAT HUNT",
    icon: "[ T ]",
    description: "Full threat hunting across multiple intelligence sources",
    steps: [
      { label: "Scan IP reputation", module: "cyber", action: "IP Tracker — AbuseIPDB + VT" },
      { label: "Investigate associated domain", module: "cyber", action: "Domain Investigator — Full scan" },
      { label: "Check URLhaus malware DB", module: "cyber", action: "Cyber Intel — URLhaus check" },
      { label: "Search GreyNoise", module: "cyber", action: "Cyber Intel — GreyNoise analysis" },
      { label: "Run Shodan search", module: "cyber", action: "Shodan — Device discovery" },
      { label: "Calculate final threat score", module: "threat", action: "Threat Score — Full assessment" },
      { label: "Generate threat hunt report", module: "reports", action: "Reports — CYBER THREAT type" },
    ],
    color: "#cc0000",
    usecase: "Use for comprehensive cyber threat investigation combining multiple intelligence sources.",
    example: "Target: malware-c2.net → IP: 185.x.x.x AbuseIPDB 95%, Shodan: 3 open ports, Threat Score: 94 CRITICAL"
  },
];

export default function Playbooks() {
  const [selected, setSelected] = useState(null);
  const [running, setRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [target, setTarget] = useState("");
  const navigate = useNavigate();

  const startPlaybook = async (playbook) => {
    if (!target.trim()) return;
    setRunning(true);
    setCompletedSteps([]);
    for (let i = 0; i < playbook.steps.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setCompletedSteps(prev => [...prev, i]);
    }
    setRunning(false);
  };

  const navigateToModule = (module) => {
    const routes = {
      identity: "/identity", cyber: "/cyber", geo: "/geo",
      news: "/news", visual: "/visual", ai: "/ai",
      recon: "/recon", threat: "/threat-score",
      graph: "/graph", reports: "/reports",
    };
    if (routes[module]) navigate(routes[module]);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* Left — Playbook list */}
      <div style={{ width: "260px", borderRight: "1px solid #440000",
        background: "#030000", overflowY: "auto" }}>
        <div style={{ padding: "12px", borderBottom: "1px solid #440000" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "4px" }}>
            OSINT PLAYBOOKS
          </div>
          <div style={{ color: "#440000", fontSize: "10px" }}>
            Pre-built investigation templates
          </div>
        </div>

        {PLAYBOOKS.map(pb => (
          <div key={pb.id} onClick={() => { setSelected(pb); setCompletedSteps([]); setTarget(""); }}
            style={{ padding: "12px", borderBottom: "1px solid #220000", cursor: "pointer",
              background: selected?.id === pb.id ? "#0d0000" : "transparent",
              borderLeft: `3px solid ${selected?.id === pb.id ? pb.color : "transparent"}` }}
            onMouseEnter={e => { if (selected?.id !== pb.id) e.currentTarget.style.background = "#060000"; }}
            onMouseLeave={e => { if (selected?.id !== pb.id) e.currentTarget.style.background = "transparent"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "10px", color: pb.color, fontFamily: "Courier New" }}>
                {pb.icon}
              </span>
              <span style={{ fontSize: "11px", color: selected?.id === pb.id ? pb.color : "#882222",
                fontWeight: "bold" }}>
                {pb.title}
              </span>
            </div>
            <div style={{ fontSize: "10px", color: "#440000", lineHeight: "1.4" }}>
              {pb.description}
            </div>
            <div style={{ marginTop: "4px", fontSize: "9px", color: "#330000" }}>
              {pb.steps.length} STEPS
            </div>
          </div>
        ))}
      </div>

      {/* Right — Playbook detail */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0" }}>

        {!selected ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", color: "#220000" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>[ PB ]</div>
            <div style={{ fontSize: "13px", letterSpacing: "3px" }}>SELECT A PLAYBOOK</div>
            <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
              Choose an investigation template from the left panel
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #330000",
              background: "#060000", display: "flex", alignItems: "center",
              justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "bold",
                  color: selected.color, letterSpacing: "2px", marginBottom: "4px" }}>
                  {selected.title}
                </div>
                <div style={{ fontSize: "10px", color: "#552222" }}>{selected.description}</div>
              </div>
              <div style={{ fontSize: "11px", color: "#440000" }}>
                {selected.steps.length} STEPS
              </div>
            </div>

            <div style={{ padding: "16px 20px" }}>
              {/* Use case */}
              <div style={{ padding: "12px 14px", marginBottom: "16px",
                background: "#060000", border: "1px solid #330000",
                borderLeft: `3px solid ${selected.color}` }}>
                <div style={{ color: selected.color, fontSize: "10px",
                  letterSpacing: "2px", marginBottom: "6px" }}>USE CASE</div>
                <div style={{ color: "#882222", fontSize: "11px", lineHeight: "1.6" }}>
                  {selected.usecase}
                </div>
              </div>

              {/* Example */}
              <div style={{ padding: "10px 14px", marginBottom: "20px",
                background: "#060000", border: "1px solid #220000" }}>
                <div style={{ color: "#440000", fontSize: "9px",
                  letterSpacing: "2px", marginBottom: "4px" }}>EXAMPLE OUTPUT</div>
                <div style={{ color: "#552222", fontSize: "10px",
                  fontFamily: "Courier New", lineHeight: "1.5" }}>
                  {selected.example}
                </div>
              </div>

              {/* Target input */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ color: "#882222", fontSize: "10px",
                  marginBottom: "6px", letterSpacing: "1px" }}>
                  ENTER TARGET
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="text" value={target}
                    onChange={e => setTarget(e.target.value)}
                    placeholder="Enter target for this playbook..."
                    style={{ flex: 1, background: "#060000", border: "1px solid #440000",
                      borderLeft: `3px solid ${selected.color}`, color: "#ff2222",
                      fontFamily: "Courier New", fontSize: "11px", padding: "8px 12px" }} />
                  <button onClick={() => startPlaybook(selected)}
                    disabled={!target.trim() || running}
                    style={{ padding: "8px 16px", fontSize: "11px", letterSpacing: "1px",
                      cursor: target ? "pointer" : "not-allowed", fontFamily: "Courier New",
                      background: target ? "#1a0000" : "#060000",
                      border: `1px solid ${target ? selected.color : "#440000"}`,
                      color: target ? selected.color : "#662222" }}>
                    {running ? "RUNNING..." : "RUN PLAYBOOK"}
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div>
                <div style={{ color: "#ff0000", fontSize: "11px",
                  letterSpacing: "3px", marginBottom: "12px" }}>
                  INVESTIGATION STEPS
                </div>
                {selected.steps.map((step, i) => {
                  const isDone = completedSteps.includes(i);
                  const isActive = running && completedSteps.length === i;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "stretch",
                      gap: "12px", marginBottom: "6px" }}>
                      {/* Step number + line */}
                      <div style={{ display: "flex", flexDirection: "column",
                        alignItems: "center", minWidth: "24px" }}>
                        <div style={{
                          width: "22px", height: "22px", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "9px", fontFamily: "Courier New", flexShrink: 0,
                          background: isDone ? selected.color : isActive ? "#0d0000" : "#060000",
                          border: `1px solid ${isDone ? selected.color : isActive ? selected.color : "#330000"}`,
                          color: isDone ? "#000" : isActive ? selected.color : "#440000",
                        }}>
                          {isDone ? "✓" : i + 1}
                        </div>
                        {i < selected.steps.length - 1 && (
                          <div style={{ width: "1px", flex: 1, marginTop: "2px",
                            background: isDone ? selected.color + "44" : "#220000" }} />
                        )}
                      </div>
                      {/* Step content */}
                      <div style={{ flex: 1, padding: "8px 12px", marginBottom: "4px",
                        background: isDone ? "#0d0000" : isActive ? "#080000" : "#060000",
                        border: `1px solid ${isDone ? selected.color + "44" : isActive ? selected.color : "#220000"}`,
                        cursor: "pointer" }}
                        onClick={() => navigateToModule(step.module)}>
                        <div style={{ display: "flex", justifyContent: "space-between",
                          alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: "bold",
                            color: isDone ? selected.color : isActive ? "#ff4400" : "#662222" }}>
                            {step.label}
                          </span>
                          <span style={{ fontSize: "9px", color: "#330000" }}>
                            {isActive ? "RUNNING..." : isDone ? "DONE" : "CLICK →"}
                          </span>
                        </div>
                        <div style={{ fontSize: "10px", color: "#440000",
                          marginTop: "2px", fontFamily: "Courier New" }}>
                          {step.action}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion message */}
              {completedSteps.length === selected.steps.length && !running && completedSteps.length > 0 && (
                <div style={{ marginTop: "16px", padding: "14px",
                  background: "#0d0000", border: `1px solid ${selected.color}`,
                  borderLeft: `4px solid ${selected.color}` }}>
                  <div style={{ color: selected.color, fontSize: "11px",
                    letterSpacing: "2px", marginBottom: "6px" }}>
                    PLAYBOOK COMPLETE
                  </div>
                  <div style={{ color: "#882222", fontSize: "11px", lineHeight: "1.6" }}>
                    All {selected.steps.length} steps completed for target: <span style={{ color: selected.color }}>{target}</span>.
                    Click any step above to navigate to that module and run the investigation.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
