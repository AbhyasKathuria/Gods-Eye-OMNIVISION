import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import GodsEyeLogo from "../components/dashboard/GodsEyeLogo";
import axios from "axios";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ethics, setEthics] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // System Seeding Wizard states
  const [initialized, setInitialized] = useState(true);
  const [checkingInit, setCheckingInit] = useState(true);
  const [seedUsername, setSeedUsername] = useState("");
  const [seedPassword, setSeedPassword] = useState("");
  const [seedConfirm, setSeedConfirm] = useState("");
  const [seedSuccess, setSeedSuccess] = useState("");

  useEffect(() => {
    const checkInitStatus = async () => {
      try {
        const res = await axios.get("http://localhost:8000/auth/init-status");
        setInitialized(res.data.initialized);
      } catch (e) {
        console.error("Failed to fetch initialization status", e);
      } finally {
        setCheckingInit(false);
      }
    };
    checkInitStatus();
  }, []);

  const handleLogin = async () => {
    if (!ethics) { setError("You must accept the ethics agreement to proceed."); return; }
    if (!username || !password) { setError("Username and password required."); return; }
    setLoading(true);
    setError("");
    try {
      await login(username, password, ethics);
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.detail || "Authentication failed");
    }
    setLoading(false);
  };

  const handleInitialize = async () => {
    if (!seedUsername.trim()) { setError("Admin username is required."); return; }
    if (!seedPassword || !seedConfirm) { setError("Admin passwords are required."); return; }
    if (seedPassword !== seedConfirm) { setError("Passwords do not match."); return; }
    if (seedPassword.length < 8) { setError("Password must be at least 8 characters long."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:8000/auth/register-admin", {
        username: seedUsername,
        password: seedPassword
      });
      if (res.data.status === "success") {
        setSeedSuccess("System initialized! Please login with your new credentials.");
        setInitialized(true);
        setUsername(seedUsername);
        setSeedUsername("");
        setSeedPassword("");
        setSeedConfirm("");
      }
    } catch (e) {
      setError(e.response?.data?.detail || "System initialization failed.");
    }
    setLoading(false);
  };

  if (checkingInit) {
    return (
      <div style={{
        height: "100vh", width: "100vw", background: "#000000",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Courier New", color: "#ff0000", fontSize: "14px",
        letterSpacing: "4px"
      }}>
        CONNECTING TO OMNIVISION NETWORK...
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh", width: "100vw", background: "#000000",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Courier New", position: "relative", overflow: "hidden"
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.05,
        backgroundImage: "linear-gradient(#ff0000 1px, transparent 1px), linear-gradient(90deg, #ff0000 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />

      {/* Scan line */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: "2px",
        background: "rgba(255,0,0,0.2)", animation: "scanLine 3s linear infinite",
        pointerEvents: "none"
      }} />

      <style>{`
        @keyframes scanLine { 0%{top:0} 100%{top:100vh} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{
        width: "440px", background: "#060000",
        border: "1px solid #ff0000", borderTop: "3px solid #ff0000",
        padding: "32px", position: "relative",
        animation: "fadeIn 0.5s ease"
      }}>

        {/* Animated Logo */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <GodsEyeLogo size={90} />
          </div>
          <div style={{ fontSize: "26px", fontWeight: "bold",
            color: "#ff0000", letterSpacing: "8px", marginBottom: "4px" }}>
            GOD'S EYE
          </div>
          <div style={{ fontSize: "10px", color: "#440000", letterSpacing: "4px" }}>
            OMNIVISION INTELLIGENCE PLATFORM
          </div>
          <div style={{ display: "flex", justifyContent: "center",
            alignItems: "center", gap: "6px", marginTop: "8px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%",
              background: "#ff0000", animation: "blink 0.6s infinite" }} />
            <span style={{ fontSize: "10px", color: "#ff4444", letterSpacing: "2px" }}>
              {initialized ? "SYSTEM ONLINE" : "SYSTEM UNINITIALIZED"}
            </span>
          </div>
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #330000", marginBottom: "20px" }} />

        {/* Seeding Success Banner */}
        {seedSuccess && (
          <div style={{ marginBottom: "16px", padding: "10px",
            background: "#001a02", border: "1px solid #00ff1a",
            color: "#00ff1a", fontSize: "11px", letterSpacing: "1px" }}>
            {seedSuccess}
          </div>
        )}

        {/* Seeding Wizard (First boot) */}
        {!initialized ? (
          <div>
            <div style={{ fontSize: "11px", color: "#ff5555", letterSpacing: "1px",
              lineHeight: "1.6", marginBottom: "16px", padding: "10px",
              background: "#150000", border: "1px dashed #ff0000" }}>
              ⚠️ SECURITY DIRECTIVE: System initialization required. Please configure the initial root administrator credentials.
            </div>

            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "10px", color: "#ff4400",
                letterSpacing: "2px", marginBottom: "6px" }}>
                CREATE ADMIN USERNAME
              </div>
              <input
                type="text"
                value={seedUsername}
                onChange={e => setSeedUsername(e.target.value)}
                placeholder="e.g. root_admin"
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#0d0000", border: "1px solid #440000",
                  borderLeft: "3px solid #ff0000",
                  color: "#ff2222", fontFamily: "Courier New", fontSize: "12px"
                }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "10px", color: "#ff4400",
                letterSpacing: "2px", marginBottom: "6px" }}>
                CREATE ACCESS CODE (MIN 8 CHARS)
              </div>
              <input
                type="password"
                value={seedPassword}
                onChange={e => setSeedPassword(e.target.value)}
                placeholder="Enter password..."
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#0d0000", border: "1px solid #440000",
                  borderLeft: "3px solid #ff0000",
                  color: "#ff2222", fontFamily: "Courier New", fontSize: "12px"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "10px", color: "#ff4400",
                letterSpacing: "2px", marginBottom: "6px" }}>
                CONFIRM ACCESS CODE
              </div>
              <input
                type="password"
                value={seedConfirm}
                onChange={e => setSeedConfirm(e.target.value)}
                placeholder="Confirm password..."
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#0d0000", border: "1px solid #440000",
                  borderLeft: "3px solid #ff0000",
                  color: "#ff2222", fontFamily: "Courier New", fontSize: "12px"
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: "12px", padding: "8px 12px",
                background: "#1a0000", border: "1px solid #ff0000",
                color: "#ff4400", fontSize: "11px" }}>
                {error}
              </div>
            )}

            <button onClick={handleInitialize} disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: loading ? "#0d0000" : "#1a0000",
                border: "1px solid #ff0000", color: "#ff0000",
                fontFamily: "Courier New", fontSize: "12px",
                letterSpacing: "3px", cursor: "pointer",
              }}>
              {loading ? "INITIALIZING..." : "INITIALIZE ROOT ACCOUNT"}
            </button>
          </div>
        ) : (
          /* Normal Login Screen */
          <div>
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "10px", color: "#ff4400",
                letterSpacing: "2px", marginBottom: "6px" }}>
                OPERATOR ID
              </div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Enter username..."
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#0d0000", border: "1px solid #440000",
                  borderLeft: "3px solid #ff0000",
                  color: "#ff2222", fontFamily: "Courier New", fontSize: "12px"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "10px", color: "#ff4400",
                letterSpacing: "2px", marginBottom: "6px" }}>
                ACCESS CODE
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="Enter password..."
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#0d0000", border: "1px solid #440000",
                  borderLeft: "3px solid #ff0000",
                  color: "#ff2222", fontFamily: "Courier New", fontSize: "12px"
                }}
              />
            </div>

            {/* Ethics */}
            <div style={{ marginBottom: "20px", padding: "12px",
              background: "#0d0000", border: "1px solid #330000" }}>
              <div style={{ fontSize: "10px", color: "#882222",
                marginBottom: "8px", lineHeight: "1.6" }}>
                ETHICS AGREEMENT: I confirm that I will use this platform
                for lawful, educational, or authorized security research purposes only.
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px",
                cursor: "pointer" }} onClick={() => setEthics(!ethics)}>
                <div style={{
                  width: "14px", height: "14px", border: "1px solid #ff0000",
                  background: ethics ? "#ff0000" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {ethics && <span style={{ color: "#000", fontSize: "10px" }}>✓</span>}
                </div>
                <span style={{ fontSize: "11px", color: ethics ? "#ff4400" : "#552222" }}>
                  I understand and agree to use this responsibly
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginBottom: "12px", padding: "8px 12px",
                background: "#1a0000", border: "1px solid #ff0000",
                color: "#ff4400", fontSize: "11px" }}>
                {error}
              </div>
            )}

            {/* Login button */}
            <button onClick={handleLogin} disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: loading ? "#0d0000" : "#1a0000",
                border: "1px solid #ff0000", color: "#ff0000",
                fontFamily: "Courier New", fontSize: "12px",
                letterSpacing: "3px", cursor: "pointer",
              }}>
              {loading ? "AUTHENTICATING..." : "INITIATE ACCESS"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
