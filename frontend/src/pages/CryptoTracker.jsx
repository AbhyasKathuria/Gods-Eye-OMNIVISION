import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function CryptoTracker() {
  const [coin, setCoin] = useState("ETH");
  const [address, setAddress] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const res = await axios.get(`${API}/crypto/balance/${coin.toLowerCase()}/${address.trim()}`);
      if (res.data.status === "success") {
        setResults(res.data);
      } else {
        setError(res.data.message || "Failed to retrieve wallet details");
      }
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  const s = {
    section: { marginBottom: "16px", padding: "12px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
    row: { fontSize: "11px", marginBottom: "4px" },
    label: { color: "#ff4400" },
    value: { color: "#882222" },
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>
      {/* Left Input Panel */}
      <div style={{
        width: "280px", display: "flex", flexDirection: "column",
        gap: "12px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", overflowY: "auto"
      }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          CRYPTO TRACKER
        </div>

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            SELECT LEDGER
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {["ETH", "BTC"].map(c => (
              <button key={c} onClick={() => { setCoin(c); setResults(null); }}
                style={{
                  flex: 1, padding: "8px", fontSize: "11px", cursor: "pointer",
                  fontFamily: "Courier New",
                  background: coin === c ? "#1a0000" : "#060000",
                  border: `1px solid ${coin === c ? "#ff0000" : "#330000"}`,
                  color: coin === c ? "#ff0000" : "#552222",
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            WALLET ADDRESS
          </div>
          <input
            type="text"
            placeholder={coin === "ETH" ? "0x742d35Cc66..." : "1A1zP1eP5Q..."}
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleTrack()}
            style={{
              width: "100%", background: "#060000",
              border: "1px solid #440000", borderLeft: "3px solid #ff0000",
              color: "#ff2222", fontFamily: "Courier New",
              fontSize: "11px", padding: "8px 12px"
            }}
          />
          <button onClick={handleTrack} disabled={!address.trim() || loading}
            style={{
              width: "100%", padding: "8px", marginTop: "6px",
              fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
              fontFamily: "Courier New",
              background: address ? "#1a0000" : "#060000",
              border: `1px solid ${address ? "#ff0000" : "#440000"}`,
              color: address ? "#ff0000" : "#662222",
            }}>
            {loading ? "CHECKING BLOCKCHAIN..." : "ANALYZE WALLET"}
          </button>
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />
        <div style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px" }}>
          QUICK TARGETS
        </div>
        {[
          { label: "Genesis Block BTC", action: () => { setCoin("BTC"); setAddress("1A1zP1eP5Qgefi2DMPTfTL5SLmv7DivfNa"); }},
          { label: "Safe Contract ETH", action: () => { setCoin("ETH"); setAddress("0x38651c6c641d8e1e1e1e1e1e1e1e1e1e1e1e1e1e"); }},
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

      {/* Right Output Panel */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #330000",
          background: "#060000", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>
            LEDGER AUDIT: {coin}
          </div>
          {results && (
            <div style={{ color: "#440000", fontSize: "11px" }}>
              AUDIT RUN SUCCESSFULLY
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {!results && !loading && !error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", color: "#220000" }}>
              <div style={{ fontSize: "48px", color: "#1a0000", marginBottom: "16px" }}>[ ETH / BTC ]</div>
              <div style={{ fontSize: "13px", letterSpacing: "3px" }}>ENTER BLOCKCHAIN ADDRESS TO AUDIT</div>
              <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
                Fetches balances and latest transaction chains in real-time
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "12px" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
                className="animate-pulse">
                RETRIEVING LEDGER RECORDS...
              </div>
              <div style={{ color: "#440000", fontSize: "11px" }}>
                Querying Ethereum/Bitcoin explorers in parallel
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px", border: "1px solid #ff0000", background: "#0d0000" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", marginBottom: "4px" }}>
                LEDGER ERROR
              </div>
              <div style={{ color: "#882222", fontSize: "11px" }}>{error}</div>
            </div>
          )}

          {results && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Wallet Summary */}
              <div style={s.section}>
                <div style={s.title}>WALLET SUMMARY</div>
                <div style={s.grid2}>
                  <div style={s.row}><span style={s.label}>ADDRESS: </span><span style={{ color: "#ff2222", fontSize: "11px" }}>{results.address}</span></div>
                  <div style={s.row}><span style={s.label}>LEDGER COIN: </span><span style={s.value}>{results.coin}</span></div>
                  <div style={s.row}><span style={s.label}>CURRENT BALANCE: </span><span style={{ color: "#00ff00", fontWeight: "bold" }}>{results.balance} {results.coin}</span></div>
                  {results.coin === "BTC" && (
                    <>
                      <div style={s.row}><span style={s.label}>TOTAL RECEIVED: </span><span style={s.value}>{results.total_received} BTC</span></div>
                      <div style={s.row}><span style={s.label}>TOTAL SENT: </span><span style={s.value}>{results.total_sent} BTC</span></div>
                    </>
                  )}
                </div>
              </div>

              {/* Transfer Flow Visualizer */}
              <div style={s.section}>
                <div style={s.title}>LEDGER TRANSFER ROUTE (VISUAL REPRESENTATION)</div>
                <div style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "20px 0", background: "#040000", border: "1px dashed #220000",
                  gap: "12px", overflowX: "auto"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ padding: "6px 12px", border: "1px solid #882222", background: "#1a0000", color: "#ff2222", fontSize: "10px" }}>
                      TARGET WALLET
                      <div style={{ fontSize: "8px", color: "#666" }}>{results.address.slice(0, 8)}...</div>
                    </div>
                    <div style={{ color: "#ff0000" }}>➡️</div>
                    <div style={{ padding: "6px 12px", border: "1px solid #00aa00", background: "#001a00", color: "#00ff00", fontSize: "10px" }}>
                      CURRENT LEDGER
                      <div style={{ fontSize: "9px", fontWeight: "bold" }}>{results.balance} {results.coin}</div>
                    </div>
                  </div>
                  <div style={{ color: "#440000", fontSize: "9px", letterSpacing: "1px" }}>
                    LATEST TRANSFER RELAYS
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                    {results.transactions.slice(0, 3).map((t, idx) => (
                      <div key={idx} style={{
                        padding: "6px", background: "#090000", border: "1px solid #440000",
                        fontSize: "9px", display: "flex", flexDirection: "column", gap: "3px"
                      }}>
                        <div style={{ color: "#ff8800" }}>TX #{idx+1}</div>
                        <div style={{ color: "#aaa" }}>Val: {t.value} {results.coin}</div>
                        <div style={{ color: "#555" }}>Hash: {t.hash.slice(0, 10)}...</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transactions list */}
              <div style={s.section}>
                <div style={s.title}>TRANSACTION HISTORY (LATEST 10)</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", fontFamily: "Courier New" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #440000", color: "#ff4400", textAlign: "left" }}>
                        <th style={{ padding: "6px" }}>TX HASH</th>
                        <th style={{ padding: "6px" }}>FROM</th>
                        <th style={{ padding: "6px" }}>TO</th>
                        <th style={{ padding: "6px", textAlign: "right" }}>VALUE ({results.coin})</th>
                        <th style={{ padding: "6px" }}>BLOCK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.transactions.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: "12px", textAlign: "center", color: "#444" }}>
                            NO TRANSACTIONS FOUND
                          </td>
                        </tr>
                      ) : (
                        results.transactions.map((t, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #110000", color: "#aaa" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#0c0202"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <td style={{ padding: "6px", color: "#ff2222" }}>
                              <a href={results.coin === "ETH" ? `https://etherscan.io/tx/${t.hash}` : `https://live.blockcypher.com/btc/tx/${t.hash}`}
                                target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                                {t.hash.slice(0, 12)}...
                              </a>
                            </td>
                            <td style={{ padding: "6px" }}>{t.from.slice(0, 10)}...</td>
                            <td style={{ padding: "6px" }}>{t.to.slice(0, 10)}...</td>
                            <td style={{ padding: "6px", textAlign: "right", color: "#00ff00" }}>{t.value}</td>
                            <td style={{ padding: "6px" }}>{t.blockNumber}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
