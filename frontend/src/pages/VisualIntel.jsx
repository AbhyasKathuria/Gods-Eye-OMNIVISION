import { useState, useRef } from "react";
import axios from "axios";

const API = "http://localhost:8000";
const TABS = ["IMAGE ANALYSIS", "REVERSE SEARCH", "URL SEARCH"];

export default function VisualIntel() {
  const [activeTab, setActiveTab] = useState("IMAGE ANALYSIS");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setResults(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(",")[1];
      setImageData(base64);
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (activeTab === "URL SEARCH") {
      if (!urlInput.trim()) return;
      setLoading(true);
      setResults(null);
      setError(null);
      try {
        const res = await axios.get(`${API}/visual/search?url=${encodeURIComponent(urlInput)}`);
        setResults(res.data.data);
      } catch (e) {
        setError(e.response?.data?.detail || e.message);
      }
      setLoading(false);
      return;
    }

    if (!imageData) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      let res;
      if (activeTab === "IMAGE ANALYSIS") {
        res = await axios.post(`${API}/visual/analyze`, {
          image_data: imageData,
          filename: image?.name || "image.jpg"
        });
        setResults(res.data);
      } else if (activeTab === "REVERSE SEARCH") {
        res = await axios.post(`${API}/visual/reverse`, {
          image_data: imageData
        });
        setResults(res.data.data);
      }
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  const s = {
    section: { marginBottom: "12px", padding: "12px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" },
    row: { fontSize: "11px", marginBottom: "4px" },
    label: { color: "#ff4400" },
    value: { color: "#882222" },
  };

  const renderAnalysis = () => (
    <div>
      {/* Metadata */}
      {results?.metadata?.data?.metadata && (
        <div style={s.section}>
          <div style={s.title}>IMAGE METADATA</div>
          <div style={{ marginBottom: "8px", padding: "6px 10px",
            background: results.metadata.data.metadata.risk_level === "HIGH" ? "#1a0000" : "#0d0000",
            border: `1px solid ${results.metadata.data.metadata.risk_level === "HIGH" ? "#ff0000" : "#330000"}`,
            color: results.metadata.data.metadata.risk_level === "HIGH" ? "#ff0000" : "#882222",
            fontSize: "11px", letterSpacing: "2px" }}>
            RISK LEVEL: {results.metadata.data.metadata.risk_level}
          </div>

          <div style={s.grid2}>
            {[
              ["FORMAT", results.metadata.data.metadata.format],
              ["SIZE", results.metadata.data.metadata.size],
              ["MODE", results.metadata.data.metadata.mode],
            ].map(([k, v]) => v && (
              <div key={k} style={s.row}>
                <span style={s.label}>{k}: </span>
                <span style={s.value}>{String(v)}</span>
              </div>
            ))}
          </div>

          {results.metadata.data.metadata.risk_indicators?.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <div style={{ color: "#ff4400", fontSize: "10px", marginBottom: "4px" }}>RISK INDICATORS:</div>
              {results.metadata.data.metadata.risk_indicators.map((r, i) => (
                <div key={i} style={{ color: "#ff2222", fontSize: "11px",
                  padding: "3px 6px", marginBottom: "3px",
                  background: "#1a0000", border: "1px solid #330000" }}>
                  {r}
                </div>
              ))}
            </div>
          )}

          {/* GPS */}
          {results.metadata.data.metadata.gps_coords && (
            <div style={{ marginTop: "8px", padding: "8px",
              background: "#1a0000", border: "1px solid #ff0000" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", marginBottom: "6px" }}>
                GPS COORDINATES FOUND!
              </div>
              <div style={s.row}>
                <span style={s.label}>LAT: </span>
                <span style={s.value}>{results.metadata.data.metadata.gps_coords.latitude}</span>
              </div>
              <div style={s.row}>
                <span style={s.label}>LON: </span>
                <span style={s.value}>{results.metadata.data.metadata.gps_coords.longitude}</span>
              </div>
              <a href={results.metadata.data.metadata.gps_coords.google_maps}
                target="_blank" rel="noreferrer"
                style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none",
                  display: "block", marginTop: "6px" }}>
                VIEW ON GOOGLE MAPS
              </a>
              <a href={results.metadata.data.metadata.gps_coords.openstreetmap}
                target="_blank" rel="noreferrer"
                style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none",
                  display: "block", marginTop: "4px" }}>
                VIEW ON OPENSTREETMAP
              </a>
            </div>
          )}

          {/* EXIF */}
          {Object.keys(results.metadata.data.metadata.exif || {}).length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <div style={{ color: "#ff4400", fontSize: "10px", marginBottom: "4px" }}>EXIF DATA:</div>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {Object.entries(results.metadata.data.metadata.exif).slice(0, 20).map(([k, v]) => (
                  <div key={k} style={s.row}>
                    <span style={s.label}>{k}: </span>
                    <span style={s.value}>{String(v).slice(0, 60)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reverse search results */}
      {results?.reverse_search?.saucenao?.matches?.length > 0 && (
        <div style={s.section}>
          <div style={s.title}>IMAGE MATCHES FOUND</div>
          {results.reverse_search.saucenao.matches.map((m, i) => (
            <div key={i} style={{ padding: "8px", marginBottom: "6px",
              background: "#0d0000", border: "1px solid #330000",
              borderLeft: "2px solid #ff4400" }}>
              <div style={s.row}>
                <span style={s.label}>SIMILARITY: </span>
                <span style={{ color: parseFloat(m.similarity) > 85 ? "#ff0000" : "#882222" }}>
                  {m.similarity}%
                </span>
              </div>
              {m.index_name && (
                <div style={s.row}>
                  <span style={s.label}>SOURCE: </span>
                  <span style={s.value}>{m.index_name}</span>
                </div>
              )}
              {m.ext_urls?.map((url, j) => (
                <a key={j} href={url} target="_blank" rel="noreferrer"
                  style={{ color: "#ff4400", fontSize: "11px",
                    textDecoration: "none", display: "block", marginTop: "4px" }}>
                  VIEW SOURCE
                </a>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReverseSearch = () => (
    <div>
      {results?.saucenao?.matches?.length > 0 ? (
        <div style={s.section}>
          <div style={s.title}>SAUCENAO MATCHES — {results.saucenao.matches.length} FOUND</div>
          {results.saucenao.matches.map((m, i) => (
            <div key={i} style={{ padding: "8px", marginBottom: "6px",
              background: "#0d0000", border: "1px solid #330000" }}>
              <div style={s.row}>
                <span style={s.label}>SIMILARITY: </span>
                <span style={{ color: parseFloat(m.similarity) > 85 ? "#ff0000" : "#882222" }}>
                  {m.similarity}%
                </span>
              </div>
              {m.title && <div style={s.row}><span style={s.label}>TITLE: </span>
                <span style={s.value}>{m.title}</span></div>}
              {m.index_name && <div style={s.row}><span style={s.label}>INDEX: </span>
                <span style={s.value}>{m.index_name}</span></div>}
              {m.ext_urls?.map((url, j) => (
                <a key={j} href={url} target="_blank" rel="noreferrer"
                  style={{ color: "#ff4400", fontSize: "11px",
                    textDecoration: "none", display: "block", marginTop: "4px" }}>
                  VIEW SOURCE {j + 1}
                </a>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={s.section}>
          <div style={{ color: "#440000", fontSize: "11px" }}>No matches found via SauceNAO</div>
        </div>
      )}
    </div>
  );

  const renderUrlSearch = () => (
    <div>
      {results?.search_links && (
        <div style={s.section}>
          <div style={s.title}>REVERSE IMAGE SEARCH LINKS</div>
          {Object.entries(results.search_links).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noreferrer"
              style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none",
                display: "block", padding: "8px", marginBottom: "6px",
                background: "#0d0000", border: "1px solid #330000",
                borderLeft: "2px solid #ff0000" }}>
              {k.toUpperCase().replace("_", " ")} — SEARCH IMAGE
            </a>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* Left Panel */}
      <div style={{ width: "260px", display: "flex", flexDirection: "column",
        gap: "12px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", overflowY: "auto" }}>

        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          VISUAL INTELLIGENCE
        </div>

        {TABS.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setResults(null); }}
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

        {activeTab !== "URL SEARCH" ? (
          <div>
            <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px" }}>
              UPLOAD IMAGE
            </div>
            <input ref={fileRef} type="file"
              accept="image/*" onChange={handleImageUpload}
              style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()}
              style={{
                width: "100%", padding: "8px", marginBottom: "6px",
                fontSize: "11px", cursor: "pointer", fontFamily: "Courier New",
                background: "#060000", border: "2px dashed #440000", color: "#552222",
              }}>
              {image ? image.name.slice(0, 22) : "CLICK TO UPLOAD IMAGE"}
            </button>

            {imagePreview && (
              <div style={{ marginBottom: "8px" }}>
                <img src={imagePreview} alt="preview"
                  style={{ width: "100%", border: "1px solid #330000",
                    maxHeight: "120px", objectFit: "cover" }} />
              </div>
            )}

            <button onClick={handleAnalyze}
              disabled={!imageData || loading}
              style={{
                width: "100%", padding: "8px",
                fontSize: "11px", cursor: "pointer", fontFamily: "Courier New",
                background: imageData ? "#1a0000" : "#060000",
                border: `1px solid ${imageData ? "#ff0000" : "#440000"}`,
                color: imageData ? "#ff0000" : "#662222",
              }}>
              {loading ? "ANALYZING..." :
               activeTab === "IMAGE ANALYSIS" ? "ANALYZE IMAGE" : "REVERSE SEARCH"}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px" }}>
              IMAGE URL
            </div>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAnalyze()}
              style={{
                width: "100%", background: "#060000",
                border: "1px solid #440000", borderLeft: "3px solid #ff0000",
                color: "#ff2222", fontFamily: "Courier New",
                fontSize: "11px", padding: "8px 12px", marginBottom: "6px"
              }}
            />
            <button onClick={handleAnalyze} disabled={!urlInput.trim() || loading}
              style={{
                width: "100%", padding: "8px",
                fontSize: "11px", cursor: "pointer", fontFamily: "Courier New",
                background: "#1a0000", border: "1px solid #ff0000", color: "#ff0000",
              }}>
              {loading ? "SEARCHING..." : "SEARCH"}
            </button>
          </div>
        )}

        <div style={{ padding: "8px", background: "#0d0000",
          border: "1px solid #330000", fontSize: "10px", color: "#440000", lineHeight: "1.5" }}>
          Extracts EXIF, GPS coords, device info. Reverse searches via SauceNAO. All public data only.
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #330000",
          background: "#060000", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>{activeTab}</div>
          {results && <div style={{ color: "#440000", fontSize: "11px" }}>ANALYSIS COMPLETE</div>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {!results && !loading && !error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", color: "#220000" }}>
              <div style={{ fontSize: "48px", color: "#1a0000", marginBottom: "16px" }}>[ V ]</div>
              <div style={{ fontSize: "13px", letterSpacing: "3px" }}>UPLOAD IMAGE TO ANALYZE</div>
              <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
                EXIF / GPS / Reverse Search / Metadata
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "12px" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
                className="animate-pulse">
                ANALYZING IMAGE INTELLIGENCE...
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
            activeTab === "IMAGE ANALYSIS" ? renderAnalysis() :
            activeTab === "REVERSE SEARCH" ? renderReverseSearch() :
            renderUrlSearch()
          )}
        </div>
      </div>
    </div>
  );
}
