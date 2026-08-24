import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const renderVal = (val) => {
  if (val === null || val === undefined) return "N/A";
  if (typeof val === "number") return val.toFixed(1);
  if (typeof val === "object") {
    if (val.value !== undefined) return String(val.value);
    if (val.probability !== undefined) return val.probability.toFixed(1);
    return JSON.stringify(val);
  }
  return String(val);
};

export default function IdentityEngine() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("ge_identity_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);
  const [faceResults, setFaceResults] = useState(null);
  const [luxand, setLuxand] = useState(null);
  const [facepp, setFacepp] = useState(null);
  const [geminiId, setGeminiId] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingFace, setLoadingFace] = useState(false);
  const [exif, setExif] = useState(null);
  const [metaIntel, setMetaIntel] = useState(null);
  const [activeTab, setActiveTab] = useState("face");
  const [summary, setSummary] = useState(null);
  const [yandexUrl, setYandexUrl] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setFaceResults(null);
    setExif(null);
    setMetaIntel(null);
    setYandexUrl(null);
    setLuxand(null);
    setFacepp(null);
    setGeminiId(null);
  };

  const handleFaceSearch = async () => {
    if (!file) return;
    setLoadingFace(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/identity/face-search`, formData);
      setFaceResults(res.data.results);
      setExif(res.data.exif);
      setMetaIntel(res.data.metadata_intelligence);
      setLuxand(res.data.luxand);
      setFacepp(res.data.facepp);
      setGeminiId(res.data.gemini_id);
      if (res.data.results?.yandex_url) {
        setYandexUrl(res.data.results.yandex_url);
      }
      setActiveTab("face");
    } catch (e) {
      console.error(e);
    }
    setLoadingFace(false);
  };

  const handleFaceCheck = async () => {
    if (!file) return;
    setLoadingFace(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/identity/facecheck`, formData);
      setFaceResults(prev => ({ ...prev, facecheck: res.data.results }));
      setActiveTab("face");
    } catch (e) {
      console.error(e);
    }
    setLoadingFace(false);
  };

  const handleYandexSearch = async () => {
    if (!file) return;
    setLoadingFace(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${API}/identity/yandex-search`, formData);
      if (res.data.result?.results_url) {
        window.open(res.data.result.results_url, "_blank");
      } else {
        window.open("https://yandex.com/images/search?rpt=imageview", "_blank");
      }
    } catch (e) {
      console.error(e);
      window.open("https://yandex.com/images/search?rpt=imageview", "_blank");
    }
    setLoadingFace(false);
  };

  const handlePersonSearch = async (forcedQuery) => {
    const targetQuery = (forcedQuery && typeof forcedQuery === "string") ? forcedQuery : query;
    if (!targetQuery) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/identity/search?query=${encodeURIComponent(targetQuery)}`
      );
      setResults(res.data);
      setSummary(res.data.summary);
      setActiveTab("person");

      // Save to search history
      const item = {
        query: targetQuery,
        timestamp: new Date().toLocaleString(),
        totalResults: res.data.total,
        summarySnippet: res.data.summary ? res.data.summary.slice(0, 100) + "..." : "No summary available"
      };

      setHistory(prev => {
        const filtered = prev.filter(h => h.query.toLowerCase() !== targetQuery.toLowerCase());
        const updated = [item, ...filtered].slice(0, 10);
        localStorage.setItem("ge_identity_history", JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/identity/report`, {
        query,
        results: results?.results || [],
        face_results: faceResults,
        luxand,
        facepp,
        exif,
        metadata_intelligence: metaIntel
      });
      setReport(res.data.report);
      setActiveTab("report");
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const s = {
    base: {
      fontFamily: "Courier New", fontSize: "11px", letterSpacing: "1px",
      cursor: "pointer", width: "100%", padding: "8px", marginTop: "6px",
      background: "#060000", border: "1px solid #440000", color: "#662222",
    },
    active: {
      fontFamily: "Courier New", fontSize: "11px", letterSpacing: "1px",
      cursor: "pointer", width: "100%", padding: "8px", marginTop: "6px",
      background: "#1a0000", border: "1px solid #ff0000", color: "#ff0000",
    },
    section: {
      marginBottom: "16px", padding: "12px",
      border: "1px solid #440000", background: "#060000"
    },
    sectionTitle: {
      color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px"
    },
    grid2: {
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px"
    },
    label: { color: "#ff4400" },
    value: { color: "#882222" },
    text: { fontSize: "11px" },
  };

  const getEmotionNum = (val) => {
    if (typeof val === "number") return val;
    if (typeof val === "object" && val !== null) {
      if (typeof val.value === "number") return val.value;
      if (typeof val.probability === "number") return val.probability;
    }
    return 0;
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* LEFT PANEL */}
      <div style={{
        width: "300px", display: "flex", flexDirection: "column",
        gap: "12px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", overflowY: "auto"
      }}>
        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          IDENTITY ENGINE
        </div>

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            FACE / IMAGE SEARCH
          </div>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", cursor: "pointer", padding: "12px",
            border: "1px dashed #440000", background: "#060000", minHeight: "130px"
          }}>
            {preview
              ? <img src={preview} alt="preview" style={{
                  width: "110px", height: "110px", objectFit: "cover",
                  border: "1px solid #ff0000", marginBottom: "4px"
                }} />
              : <div style={{ color: "#440000", fontSize: "11px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", color: "#330000", marginBottom: "8px" }}>[ + ]</div>
                  CLICK TO UPLOAD FACE
                </div>
            }
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
          </label>

          <button onClick={handleFaceSearch} disabled={!file || loadingFace}
            style={file ? s.active : s.base}>
            {loadingFace ? "SCANNING ALL DATABASES..." : "INITIATE FACE SCAN"}
          </button>

          <button onClick={handleYandexSearch} disabled={!file || loadingFace}
            style={{ ...s.base, marginTop: "4px", borderColor: "#550000", color: "#662222" }}>
            YANDEX FACE SEARCH
          </button>

          <button onClick={handleFaceCheck} disabled={!file || loadingFace}
            style={{ ...s.base, marginTop: "4px", borderColor: "#440000", color: "#552222" }}>
            FACECHECK.ID SEARCH
          </button>
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            PERSON / KEYWORD SEARCH
          </div>
          <input
            type="text"
            placeholder="name, email, username..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handlePersonSearch()}
            style={{
              width: "100%", background: "#060000",
              border: "1px solid #440000", borderLeft: "3px solid #ff0000",
              color: "#ff2222", fontFamily: "Courier New",
              fontSize: "11px", padding: "8px 12px"
            }}
          />
          <button onClick={handlePersonSearch} disabled={!query || loading}
            style={query ? s.active : s.base}>
            {loading ? "SEARCHING..." : "SEARCH PERSON"}
          </button>
        </div>

        {(results || faceResults || luxand || facepp) && (
          <>
            <div style={{ borderTop: "1px solid #220000" }} />
            <button onClick={generateReport} disabled={loading}
              style={{ ...s.active, border: "2px solid #ff0000", marginTop: "0" }}>
              {loading ? "GENERATING..." : "GENERATE AI REPORT"}
            </button>
          </>
        )}

        {yandexUrl && (
          <>
            <div style={{ borderTop: "1px solid #220000" }} />
            <div style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px" }}>
              YANDEX RESULTS READY
            </div>
            <a href={yandexUrl} target="_blank" rel="noreferrer" style={{
              display: "block", padding: "8px", fontSize: "11px",
              background: "#0d0000", border: "1px solid #ff0000",
              color: "#ff0000", textDecoration: "none",
              letterSpacing: "1px", textAlign: "center"
            }}>
              OPEN YANDEX RESULTS
            </a>
          </>
        )}

        {faceResults?.search_links && (
          <>
            <div style={{ borderTop: "1px solid #220000" }} />
            <div style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px" }}>
              MANUAL SEARCH LINKS
            </div>
            {Object.entries(faceResults.search_links).map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" style={{
                display: "block", padding: "6px 8px", marginBottom: "4px",
                fontSize: "11px", background: "#060000",
                border: "1px solid #330000", color: "#662222", textDecoration: "none",
                letterSpacing: "1px"
              }}>
                {name.toUpperCase()} SEARCH
              </a>
            ))}
          </>
        )}

        {history.length > 0 && (
          <>
            <div style={{ borderTop: "1px solid #220000", marginTop: "12px", paddingTop: "12px" }} />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px", fontWeight: "bold" }}>RECENT INVESTIGATIONS</span>
                <span onClick={() => {
                  setHistory([]);
                  localStorage.removeItem("ge_identity_history");
                }} style={{ color: "#ff0000", fontSize: "9px", cursor: "pointer", letterSpacing: "1px" }}>CLEAR</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {history.map((h, i) => (
                  <div key={i} onClick={() => {
                    setQuery(h.query);
                    handlePersonSearch(h.query);
                  }} style={{
                    padding: "8px", background: "#060000", border: "1px solid #220000",
                    borderLeft: "3px solid #882222", cursor: "pointer", transition: "all 0.3s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#ff0000"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#220000"}
                  >
                    <div style={{ color: "#ff2222", fontWeight: "bold", fontSize: "11px" }}>{h.query}</div>
                    <div style={{ color: "#666", fontSize: "9px", marginTop: "2px" }}>{h.timestamp} | Found: {h.totalResults}</div>
                    <div style={{ color: "#444", fontSize: "9px", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {h.summarySnippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ display: "flex", borderBottom: "1px solid #330000", background: "#060000" }}>
          {[
            { key: "face", label: "FACE SCAN" },
            { key: "person", label: "PERSON INTEL" },
            { key: "report", label: "AI REPORT" }
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "8px 16px", fontSize: "11px", letterSpacing: "2px",
              color: activeTab === tab.key ? "#ff0000" : "#440000",
              borderBottom: activeTab === tab.key ? "2px solid #ff0000" : "2px solid transparent",
              background: "transparent", fontFamily: "Courier New",
              cursor: "pointer", border: "none",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

          {!results && !faceResults && !luxand && !loading && !loadingFace && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", color: "#220000"
            }}>
              <div style={{ fontSize: "48px", color: "#1a0000", marginBottom: "16px" }}>[ O ]</div>
              <div style={{ fontSize: "13px", letterSpacing: "3px" }}>AWAITING TARGET INPUT</div>
              <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
                Upload a face or enter a name to begin
              </div>
            </div>
          )}

          {(loading || loadingFace) && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "12px"
            }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
                className="animate-pulse">
                SCANNING GLOBAL DATABASES...
              </div>
              <div style={{ color: "#440000", fontSize: "11px" }}>
                Running face recognition across 45+ sources
              </div>
            </div>
          )}

          {/* FACE TAB */}
          {activeTab === "face" && !loadingFace && (
            <div>

              {/* Gemini Visual Identification */}
              {geminiId?.identified_name && geminiId.identified_name !== "Unknown" && (
                <div style={{ ...s.section, border: "1px solid #ff0000", background: "#0d0000" }}>
                  <div style={{ ...s.sectionTitle, color: "#ff0000", borderBottom: "1px solid #ff0000", paddingBottom: "6px" }}>
                    VISUAL IDENTIFICATION (AI)
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "bold", color: "#ffffff", letterSpacing: "2px", fontFamily: "Courier New", marginTop: "8px" }}>
                    IDENTIFIED SUBJECT: <span style={{ color: "#ff0000" }}>{geminiId.identified_name.toUpperCase()}</span>
                  </div>
                </div>
              )}

              {/* Luxand Results */}
              {luxand?.results?.length > 0 && (
                <div style={s.section}>
                  <div style={s.sectionTitle}>
                    FACE ANALYSIS — LUXAND AI ({luxand.faces_found} FACE DETECTED)
                  </div>
                  {luxand.results.map((face, i) => (
                    <div key={i} style={{ marginBottom: "12px", paddingBottom: "12px",
                      borderBottom: "1px solid #220000" }}>
                      <div style={{ color: "#ff4400", fontSize: "11px", marginBottom: "6px" }}>
                        SUBJECT {i + 1}
                      </div>
                      <div style={s.grid2}>
                        {face.age !== undefined && face.age !== null && (
                          <div style={s.text}>
                            <span style={s.label}>AGE ESTIMATE: </span>
                            <span style={s.value}>{renderVal(face.age)} years</span>
                          </div>
                        )}
                        {face.gender && (
                          <div style={s.text}>
                            <span style={s.label}>GENDER: </span>
                            <span style={s.value}>{renderVal(face.gender)}</span>
                          </div>
                        )}
                        {face.glasses !== undefined && face.glasses !== null && (
                          <div style={s.text}>
                            <span style={s.label}>GLASSES: </span>
                            <span style={s.value}>{String(face.glasses)}</span>
                          </div>
                        )}
                        {face.smile !== undefined && face.smile !== null && (
                          <div style={s.text}>
                            <span style={s.label}>SMILE: </span>
                            <span style={s.value}>{renderVal(face.smile)}%</span>
                          </div>
                        )}
                      </div>
                      {face.emotions && typeof face.emotions === "object" && (
                        <div style={{ marginTop: "6px" }}>
                          <div style={{ ...s.text, color: "#ff4400", marginBottom: "4px" }}>
                            EMOTIONS:
                          </div>
                          <div style={s.grid2}>
                            {Object.entries(face.emotions)
                              .sort((a, b) => getEmotionNum(b[1]) - getEmotionNum(a[1]))
                              .slice(0, 4)
                              .map(([emotion, val]) => (
                                <div key={emotion} style={s.text}>
                                  <span style={s.label}>{emotion.toUpperCase()}: </span>
                                  <span style={s.value}>{renderVal(val)}%</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {luxand?.error && (
                <div style={{ ...s.section, borderColor: "#330000" }}>
                  <div style={{ ...s.sectionTitle, color: "#882222" }}>LUXAND STATUS</div>
                  <div style={{ ...s.text, color: "#552222" }}>{luxand.error}</div>
                </div>
              )}

              {/* Face++ Results */}
              {facepp?.results?.length > 0 && (
                <div style={s.section}>
                  <div style={s.sectionTitle}>
                    FACE ANALYSIS — FACE++ ({facepp.faces_found} FACE DETECTED)
                  </div>
                  {facepp.results.map((face, i) => (
                    <div key={i} style={{ marginBottom: "12px", paddingBottom: "12px",
                      borderBottom: "1px solid #220000" }}>
                      <div style={{ color: "#ff4400", fontSize: "11px", marginBottom: "6px" }}>
                        SUBJECT {i + 1}
                      </div>
                      <div style={s.grid2}>
                        {face.age !== undefined && (
                          <div style={s.text}>
                            <span style={s.label}>AGE ESTIMATE: </span>
                            <span style={s.value}>{renderVal(face.age)} years</span>
                          </div>
                        )}
                        {face.gender && (
                          <div style={s.text}>
                            <span style={s.label}>GENDER: </span>
                            <span style={s.value}>{renderVal(face.gender)}</span>
                          </div>
                        )}
                      </div>
                      {face.emotion && typeof face.emotion === "object" && (
                        <div style={{ marginTop: "6px" }}>
                          <div style={{ ...s.text, color: "#ff4400", marginBottom: "4px" }}>
                            EMOTIONAL STATE:
                          </div>
                          <div style={s.grid2}>
                            {Object.entries(face.emotion)
                              .sort((a, b) => getEmotionNum(b[1]) - getEmotionNum(a[1]))
                              .slice(0, 4)
                              .map(([emotion, val]) => (
                                <div key={emotion} style={s.text}>
                                  <span style={s.label}>{emotion.toUpperCase()}: </span>
                                  <span style={s.value}>{renderVal(val)}%</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                      {face.beauty && typeof face.beauty === "object" && (
                        <div style={{ marginTop: "6px" }}>
                          <div style={{ ...s.text, color: "#ff4400", marginBottom: "4px" }}>
                            BEAUTY SCORE:
                          </div>
                          <div style={s.grid2}>
                            {Object.entries(face.beauty).map(([k, v]) => (
                              <div key={k} style={s.text}>
                                <span style={s.label}>{k.toUpperCase()}: </span>
                                <span style={s.value}>{renderVal(v)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {facepp?.error && (
                <div style={{ ...s.section, borderColor: "#330000" }}>
                  <div style={{ ...s.sectionTitle, color: "#882222" }}>FACE++ STATUS</div>
                  <div style={{ ...s.text, color: "#552222" }}>{facepp.error}</div>
                </div>
              )}

              {metaIntel && (
                <div style={s.section}>
                  <div style={s.sectionTitle}>METADATA INTELLIGENCE</div>
                  <div style={s.grid2}>
                    {Object.entries(metaIntel).map(([k, v]) => v && (
                      <div key={k} style={s.text}>
                        <span style={s.label}>{k.toUpperCase()}: </span>
                        <span style={s.value}>{String(v)}</span>
                      </div>
                    ))}
                  </div>
                  {metaIntel.risk_level === "HIGH" && (
                    <div style={{ marginTop: "8px", color: "#ff0000",
                      fontSize: "11px", letterSpacing: "2px" }}
                      className="animate-pulse">
                      GPS DATA DETECTED - LOCATION EXPOSED
                    </div>
                  )}
                </div>
              )}

              {exif && Object.keys(exif).length > 0 && (
                <div style={{ ...s.section, borderColor: "#330000" }}>
                  <div style={s.sectionTitle}>EXIF METADATA</div>
                  <div style={s.grid2}>
                    {Object.entries(exif).slice(0, 14).map(([k, v]) => (
                      <div key={k} style={s.text}>
                        <span style={s.label}>{k}: </span>
                        <span style={{ color: "#662222" }}>{String(v).slice(0, 40)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {faceResults?.saucenao?.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ ...s.sectionTitle, marginBottom: "8px" }}>
                    IMAGE MATCHES ({faceResults.saucenao.length} FOUND)
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {faceResults.saucenao.map((r, i) => (
                      <div key={i} style={{ padding: "12px",
                        border: "1px solid #330000", background: "#060000" }}>
                        {r.thumbnail && (
                          <img src={r.thumbnail} alt="" style={{
                            width: "100%", height: "96px", objectFit: "cover",
                            marginBottom: "8px", border: "1px solid #330000"
                          }} />
                        )}
                        <div style={{ fontSize: "11px", fontWeight: "bold", color: "#ff4400" }}>
                          MATCH: {parseFloat(r.similarity).toFixed(1)}%
                        </div>
                        {r.title && (
                          <div style={{ fontSize: "11px", marginTop: "4px", color: "#882222" }}>
                            {r.title.slice(0, 50)}
                          </div>
                        )}
                        {r.urls?.slice(0, 1).map((url, j) => (
                          <a key={j} href={url} target="_blank" rel="noreferrer" style={{
                            display: "block", fontSize: "11px", marginTop: "4px",
                            color: "#ff2222", textDecoration: "none"
                          }}>
                            VIEW SOURCE
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {faceResults?.yandex_url && (
                <div style={s.section}>
                  <div style={s.sectionTitle}>YANDEX REVERSE SEARCH COMPLETE</div>
                  <a href={faceResults.yandex_url} target="_blank" rel="noreferrer"
                    style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none" }}>
                    OPEN YANDEX RESULTS PAGE
                  </a>
                  <div style={{ color: "#552222", fontSize: "11px", marginTop: "4px" }}>
                    Click to see all face matches found by Yandex
                  </div>
                </div>
              )}

              {faceResults?.facecheck && !faceResults.facecheck.error && (
                <div style={s.section}>
                  <div style={s.sectionTitle}>FACECHECK.ID RESULTS</div>
                  <pre style={{ color: "#882222", fontSize: "11px",
                    whiteSpace: "pre-wrap", fontFamily: "Courier New" }}>
                    {JSON.stringify(faceResults.facecheck, null, 2).slice(0, 800)}
                  </pre>
                </div>
              )}

              {faceResults?.errors?.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  {faceResults.errors.map((e, i) => (
                    <div key={i} style={{ fontSize: "11px", padding: "8px",
                      marginBottom: "4px", background: "#0d0000",
                      color: "#552222", border: "1px solid #330000" }}>
                      {e}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PERSON TAB */}
          {activeTab === "person" && !loading && results && (
            <div>
              {summary && (
                <div style={s.section}>
                  <div style={s.sectionTitle}>OSINT SUMMARY</div>
                  <pre style={{ color: "#882222", fontSize: "11px",
                    whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.6" }}>
                    {summary.slice(0, 600)}...
                  </pre>
                </div>
              )}

              <div style={{ color: "#ff0000", fontSize: "11px",
                letterSpacing: "3px", marginBottom: "12px" }}>
                {results.total} RESULTS FOR: {results.query?.toUpperCase()}
              </div>

              {results.results?.map((r, i) => (
                <div key={i} style={{ padding: "12px", marginBottom: "8px",
                  border: "1px solid #330000", background: "#060000" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{
                      fontSize: "10px", padding: "2px 8px",
                      background: r.source === "NEWS" ? "#1a0000" : "#0d0000",
                      border: `1px solid ${r.source === "NEWS" ? "#ff0000" : "#440000"}`,
                      color: r.source === "NEWS" ? "#ff0000" : "#882222"
                    }}>
                      {r.source}
                    </span>
                    {r.outlet && (
                      <span style={{ fontSize: "10px", color: "#440000" }}>{r.outlet}</span>
                    )}
                  </div>
                  <div style={{ fontSize: "11px", fontWeight: "bold",
                    marginBottom: "4px", color: "#ff2222" }}>
                    {r.title}
                  </div>
                  {r.description && (
                    <div style={{ fontSize: "11px", marginBottom: "4px", color: "#552222" }}>
                      {r.description?.slice(0, 120)}...
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    {r.date && (
                      <span style={{ fontSize: "10px", color: "#330000" }}>
                        {new Date(r.date).toLocaleDateString()}
                      </span>
                    )}
                    <a href={r.url} target="_blank" rel="noreferrer"
                      style={{ fontSize: "11px", color: "#ff4400", textDecoration: "none" }}>
                      VIEW SOURCE
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* REPORT TAB */}
          {activeTab === "report" && report && (
            <div style={{ padding: "16px", border: "1px solid #ff0000", background: "#060000" }}>
              <div style={{ color: "#ff0000", fontSize: "11px",
                letterSpacing: "3px", marginBottom: "12px" }}>
                AI INTELLIGENCE REPORT
              </div>
              <pre style={{ color: "#882222", fontSize: "11px",
                whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.8" }}>
                {report}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}