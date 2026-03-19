import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const SUGGESTIONS = [
  "Investigate IP address 8.8.8.8",
  "What do you know about elon musk?",
  "Analyze domain google.com for threats",
  "Search news about artificial intelligence",
  "What are your capabilities?",
  "Investigate location New Delhi India",
  "Run a full OSINT investigation on tesla.com",
  "Analyze sentiment: global conflict and war",
];

const INVEST_TYPES = [
  { label: "PERSON", value: "person" },
  { label: "IP ADDRESS", value: "ip" },
  { label: "DOMAIN", value: "domain" },
  { label: "LOCATION", value: "location" },
];

export default function AIBrain() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `GODS EYE AI INTELLIGENCE SYSTEM — ONLINE

I am the central AI brain of the Gods Eye platform. I have access to:
- Identity Engine (face recognition, OSINT, person search)
- Cyber Intelligence (IP tracker, domain analysis, threat detection)
- Geo Tracker (live flights, weather, satellite imagery)
- News Monitor (global news, Reddit, sentiment analysis)
- 45+ connected intelligence APIs

How can I assist your investigation today?

Type a question or use the INVESTIGATE tool for automated multi-source analysis.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [investigateTarget, setInvestigateTarget] = useState("");
  const [investigateType, setInvestigateType] = useState("person");
  const [investigating, setInvestigating] = useState(false);
  const [investigateResults, setInvestigateResults] = useState(null);
  const [activeTab, setActiveTab] = useState("CHAT");
  const [steps, setSteps] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text = null) => {
    const userMessage = text || input.trim();
    if (!userMessage) return;

    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/ai/chat`, {
        messages: newMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        context: {
          platform: "Gods Eye OSINT Platform",
          available_modules: ["identity", "cyber", "geo", "news"],
          apis_connected: 45
        }
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.response
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `ERROR: ${e.response?.data?.detail || e.message}`
      }]);
    }
    setLoading(false);
  };

  const runInvestigation = async () => {
    if (!investigateTarget.trim()) return;
    setInvestigating(true);
    setInvestigateResults(null);
    setSteps([]);
    setActiveTab("INVESTIGATE");

    try {
      setSteps(["Initializing investigation..."]);

      const res = await axios.post(`${API}/ai/investigate`, {
        target: investigateTarget,
        type: investigateType
      });

      setSteps(res.data.steps_completed || []);
      setInvestigateResults(res.data);

      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Investigation complete for target: ${investigateTarget}\n\nType: ${investigateType.toUpperCase()}\nSteps completed: ${res.data.steps_completed?.length || 0}\n\nFinal Report:\n${res.data.results?.final_report || "No report generated"}`
      }]);
    } catch (e) {
      setSteps(prev => [...prev, `ERROR: ${e.message}`]);
    }
    setInvestigating(false);
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared. Starting new session. How can I assist your investigation?"
    }]);
    setInvestigateResults(null);
    setSteps([]);
  };

  const s = {
    section: { marginBottom: "16px", padding: "12px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" },
    row: { fontSize: "11px", marginBottom: "4px" },
    label: { color: "#ff4400" },
    value: { color: "#882222" },
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* Left Panel */}
      <div style={{
        width: "260px", display: "flex", flexDirection: "column",
        gap: "12px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", overflowY: "auto"
      }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          AI BRAIN
        </div>

        {/* Tabs */}
        <div>
          {["CHAT", "INVESTIGATE"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
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

        {/* Investigate Tool */}
        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            AUTO INVESTIGATE
          </div>
          <select value={investigateType} onChange={e => setInvestigateType(e.target.value)}
            style={{
              width: "100%", marginBottom: "6px", padding: "6px",
              background: "#060000", border: "1px solid #440000",
              color: "#882222", fontFamily: "Courier New", fontSize: "11px"
            }}>
            {INVEST_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Enter target..."
            value={investigateTarget}
            onChange={e => setInvestigateTarget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runInvestigation()}
            style={{
              width: "100%", background: "#060000",
              border: "1px solid #440000", borderLeft: "3px solid #ff0000",
              color: "#ff2222", fontFamily: "Courier New",
              fontSize: "11px", padding: "8px 12px", marginBottom: "6px"
            }}
          />

          <button onClick={runInvestigation} disabled={investigating || !investigateTarget}
            style={{
              width: "100%", padding: "8px",
              fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
              fontFamily: "Courier New",
              background: investigateTarget ? "#1a0000" : "#060000",
              border: `1px solid ${investigateTarget ? "#ff0000" : "#440000"}`,
              color: investigateTarget ? "#ff0000" : "#662222",
            }}>
            {investigating ? "INVESTIGATING..." : "RUN INVESTIGATION"}
          </button>
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />

        {/* Quick Suggestions */}
        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            QUICK QUERIES
          </div>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)}
              style={{
                width: "100%", padding: "6px 8px", marginBottom: "4px",
                fontSize: "10px", cursor: "pointer", fontFamily: "Courier New",
                textAlign: "left", background: "#060000",
                border: "1px solid #330000", color: "#552222",
                lineHeight: "1.4"
              }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />

        <button onClick={clearChat}
          style={{
            width: "100%", padding: "8px",
            fontSize: "11px", cursor: "pointer",
            fontFamily: "Courier New", background: "#060000",
            border: "1px solid #330000", color: "#552222",
          }}>
          CLEAR CHAT
        </button>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #330000",
          background: "#060000", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>
            {activeTab === "CHAT" ? "AI INTELLIGENCE CHAT" : "AUTO INVESTIGATION"}
          </div>
          <div style={{ color: "#440000", fontSize: "11px" }}>
            POWERED BY LLAMA 3.3 70B
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%",
              background: "#ff0000", animation: "blink 1s infinite" }} />
            <div style={{ color: "#440000", fontSize: "10px" }}>ONLINE</div>
          </div>
        </div>

        {/* CHAT TAB */}
        {activeTab === "CHAT" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start"
                }}>
                  <div style={{
                    fontSize: "10px", letterSpacing: "2px", marginBottom: "4px",
                    color: m.role === "user" ? "#ff4400" : "#440000"
                  }}>
                    {m.role === "user" ? "OPERATOR" : "GODS EYE AI"}
                  </div>
                  <div style={{
                    maxWidth: "85%", padding: "12px",
                    background: m.role === "user" ? "#0d0000" : "#060000",
                    border: `1px solid ${m.role === "user" ? "#ff4400" : "#330000"}`,
                    borderLeft: `3px solid ${m.role === "user" ? "#ff4400" : "#ff0000"}`,
                  }}>
                    <pre style={{
                      fontSize: "11px", whiteSpace: "pre-wrap",
                      fontFamily: "Courier New", lineHeight: "1.7",
                      color: m.role === "user" ? "#ff4400" : "#882222",
                      margin: 0
                    }}>
                      {m.content}
                    </pre>
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "2px", marginBottom: "4px", color: "#440000" }}>
                    GODS EYE AI
                  </div>
                  <div style={{ padding: "12px", background: "#060000", border: "1px solid #330000",
                    borderLeft: "3px solid #ff0000" }}>
                    <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "2px" }}
                      className="animate-pulse">
                      PROCESSING INTELLIGENCE...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #330000",
              background: "#060000", display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Ask Gods Eye anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
                style={{
                  flex: 1, background: "#0d0000",
                  border: "1px solid #440000", borderLeft: "3px solid #ff0000",
                  color: "#ff2222", fontFamily: "Courier New",
                  fontSize: "11px", padding: "10px 14px"
                }}
              />
              <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                style={{
                  padding: "10px 20px", fontSize: "11px", letterSpacing: "1px",
                  cursor: "pointer", fontFamily: "Courier New",
                  background: input ? "#1a0000" : "#060000",
                  border: `1px solid ${input ? "#ff0000" : "#440000"}`,
                  color: input ? "#ff0000" : "#662222",
                }}>
                SEND
              </button>
            </div>
          </div>
        )}

        {/* INVESTIGATE TAB */}
        {activeTab === "INVESTIGATE" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

            {!investigateResults && !investigating && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", color: "#220000" }}>
                <div style={{ fontSize: "48px", color: "#1a0000", marginBottom: "16px" }}>[ ? ]</div>
                <div style={{ fontSize: "13px", letterSpacing: "3px" }}>ENTER TARGET AND RUN INVESTIGATION</div>
                <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
                  Automatically queries all intelligence modules
                </div>
              </div>
            )}

            {investigating && (
              <div style={{ padding: "16px" }}>
                <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "16px" }}
                  className="animate-pulse">
                  RUNNING FULL INVESTIGATION...
                </div>
                {steps.map((step, i) => (
                  <div key={i} style={{ fontSize: "11px", marginBottom: "6px",
                    color: "#882222", padding: "6px",
                    border: "1px solid #220000", background: "#060000" }}>
                    <span style={{ color: "#ff4400" }}>[{i + 1}]</span> {step}
                  </div>
                ))}
              </div>
            )}

            {investigateResults && !investigating && (
              <div>
                <div style={s.section}>
                  <div style={s.title}>INVESTIGATION COMPLETE</div>
                  <div style={s.row}>
                    <span style={s.label}>TARGET: </span>
                    <span style={s.value}>{investigateResults.target}</span>
                  </div>
                  <div style={s.row}>
                    <span style={s.label}>TYPE: </span>
                    <span style={s.value}>{investigateResults.type?.toUpperCase()}</span>
                  </div>
                  <div style={s.row}>
                    <span style={s.label}>STEPS: </span>
                    <span style={s.value}>{investigateResults.steps_completed?.length}</span>
                  </div>
                </div>

                {/* Steps Completed */}
                <div style={s.section}>
                  <div style={s.title}>INVESTIGATION STEPS</div>
                  {investigateResults.steps_completed?.map((step, i) => (
                    <div key={i} style={{ fontSize: "11px", marginBottom: "4px",
                      color: "#882222", padding: "4px 8px",
                      borderLeft: "2px solid #ff0000" }}>
                      <span style={{ color: "#ff4400" }}>[{i + 1}]</span> {step}
                    </div>
                  ))}
                </div>

                {/* Final Report */}
                {investigateResults.results?.final_report && (
                  <div style={{ ...s.section, borderColor: "#ff0000" }}>
                    <div style={s.title}>FINAL INTELLIGENCE REPORT</div>
                    <pre style={{ color: "#882222", fontSize: "11px",
                      whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.8" }}>
                      {investigateResults.results.final_report}
                    </pre>
                  </div>
                )}

                {/* Threat Report */}
                {investigateResults.results?.threat_report && (
                  <div style={{ ...s.section, borderColor: "#ff4400" }}>
                    <div style={s.title}>THREAT ASSESSMENT</div>
                    <pre style={{ color: "#882222", fontSize: "11px",
                      whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.8" }}>
                      {investigateResults.results.threat_report}
                    </pre>
                  </div>
                )}

                {/* OSINT Summary */}
                {investigateResults.results?.osint_summary && (
                  <div style={s.section}>
                    <div style={s.title}>OSINT SUMMARY</div>
                    <pre style={{ color: "#882222", fontSize: "11px",
                      whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.8" }}>
                      {investigateResults.results.osint_summary}
                    </pre>
                  </div>
                )}

                {/* Geo Report */}
                {investigateResults.results?.geo_report && (
                  <div style={s.section}>
                    <div style={s.title}>GEO INTELLIGENCE</div>
                    <pre style={{ color: "#882222", fontSize: "11px",
                      whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.8" }}>
                      {investigateResults.results.geo_report}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
