import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const TABS = ["LIVE NEWS", "NEWS SEARCH", "REDDIT FEED", "TWITTER MONITOR", "SENTIMENT"];

const CATEGORIES = ["general", "business", "technology", "science", "health", "sports", "entertainment"];

export default function NewsMonitor() {
  const [activeTab, setActiveTab] = useState("LIVE NEWS");
  const [input, setInput] = useState("");
  const [subreddit, setSubreddit] = useState("worldnews");
  const [category, setCategory] = useState("general");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      let res;
      switch (activeTab) {
        case "LIVE NEWS":
          res = await axios.get(`${API}/news/top?category=${category}&country=us`);
          setResults(res.data.data);
          break;
        case "NEWS SEARCH":
          if (!input.trim()) break;
          res = await axios.get(`${API}/news/search?query=${encodeURIComponent(input)}`);
          setResults(res.data);
          break;
        case "REDDIT FEED":
          res = await axios.get(`${API}/news/reddit?subreddit=${subreddit}&sort=hot`);
          setResults(res.data.data);
          break;
        case "TWITTER MONITOR":
          if (!input.trim()) break;
          res = await axios.get(`${API}/news/twitter?query=${encodeURIComponent(input)}`);
          setResults(res.data.data);
          break;
        case "SENTIMENT":
          if (!input.trim()) break;
          res = await axios.get(`${API}/news/sentiment?text=${encodeURIComponent(input)}`);
          setResults(res.data);
          break;
        default:
          break;
      }
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  const s = {
    section: { marginBottom: "16px", padding: "12px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" },
    row: { fontSize: "11px", marginBottom: "4px" },
    label: { color: "#ff4400" },
    value: { color: "#882222" },
    article: {
      padding: "10px", marginBottom: "8px",
      border: "1px solid #330000", background: "#060000",
      borderLeft: "3px solid #ff0000"
    },
    badge: (color) => ({
      display: "inline-block", padding: "2px 6px", fontSize: "10px",
      background: color === "red" ? "#1a0000" : color === "green" ? "#001a00" : "#0a0a00",
      border: `1px solid ${color === "red" ? "#ff0000" : color === "green" ? "#00ff00" : "#444400"}`,
      color: color === "red" ? "#ff4400" : color === "green" ? "#00ff44" : "#888800",
      marginRight: "4px"
    })
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return "#882222";
    if (sentiment === "POSITIVE") return "#00aa44";
    if (sentiment === "NEGATIVE") return "#ff0000";
    return "#888800";
  };

  const renderLiveNews = () => (
    <div>
      <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "12px" }}>
        TOP HEADLINES — {results?.total || 0} ARTICLES
      </div>
      {results?.articles?.map((a, i) => (
        <div key={i} style={s.article}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={s.badge("red")}>{a.source || "UNKNOWN"}</span>
            <span style={{ fontSize: "10px", color: "#330000" }}>{formatDate(a.published)}</span>
          </div>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "#ff2222", marginBottom: "4px" }}>
            {a.title}
          </div>
          {a.description && (
            <div style={{ fontSize: "11px", color: "#552222", marginBottom: "6px" }}>
              {a.description?.slice(0, 150)}...
            </div>
          )}
          <a href={a.url} target="_blank" rel="noreferrer"
            style={{ fontSize: "11px", color: "#ff4400", textDecoration: "none" }}>
            READ FULL ARTICLE
          </a>
        </div>
      ))}
    </div>
  );

  const renderNewsSearch = () => (
    <div>
      {results?.sentiment && (
        <div style={s.section}>
          <div style={s.title}>SENTIMENT ANALYSIS</div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: "bold",
              color: getSentimentColor(results.sentiment.sentiment) }}>
              {results.sentiment.sentiment}
            </div>
            <div style={{ fontSize: "11px", color: "#882222" }}>
              Score: {results.sentiment.score}%
            </div>
          </div>
        </div>
      )}

      {results?.ai_analysis && (
        <div style={{ ...s.section, borderColor: "#ff0000" }}>
          <div style={s.title}>AI NEWS ANALYSIS</div>
          <pre style={{ color: "#882222", fontSize: "11px",
            whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.6" }}>
            {results.ai_analysis.slice(0, 800)}
          </pre>
        </div>
      )}

      <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "12px" }}>
        NEWSAPI — {results?.newsapi?.total || 0} RESULTS
      </div>
      {results?.newsapi?.articles?.map((a, i) => (
        <div key={i} style={s.article}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={s.badge("red")}>{a.source || "UNKNOWN"}</span>
            <span style={{ fontSize: "10px", color: "#330000" }}>{formatDate(a.published)}</span>
          </div>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "#ff2222", marginBottom: "4px" }}>
            {a.title}
          </div>
          {a.description && (
            <div style={{ fontSize: "11px", color: "#552222", marginBottom: "6px" }}>
              {a.description?.slice(0, 150)}...
            </div>
          )}
          <a href={a.url} target="_blank" rel="noreferrer"
            style={{ fontSize: "11px", color: "#ff4400", textDecoration: "none" }}>
            READ FULL ARTICLE
          </a>
        </div>
      ))}

      {results?.gdelt?.articles?.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "12px" }}>
            GDELT GLOBAL NEWS — {results.gdelt.articles.length} RESULTS
          </div>
          {results.gdelt.articles.map((a, i) => (
            <div key={i} style={{ ...s.article, borderLeftColor: "#ff4400" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={s.badge("yellow")}>{a.source || "UNKNOWN"}</span>
                {a.country && (
                  <span style={{ fontSize: "10px", color: "#444400" }}>{a.country?.toUpperCase()}</span>
                )}
              </div>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#ff2222", marginBottom: "4px" }}>
                {a.title}
              </div>
              {a.tone !== undefined && (
                <div style={{ fontSize: "10px", color: "#444400", marginBottom: "4px" }}>
                  TONE: {parseFloat(a.tone).toFixed(2)}
                </div>
              )}
              <a href={a.url} target="_blank" rel="noreferrer"
                style={{ fontSize: "11px", color: "#ff4400", textDecoration: "none" }}>
                READ FULL ARTICLE
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReddit = () => (
    <div>
      <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "12px" }}>
        r/{results?.subreddit?.toUpperCase()} — {results?.posts?.length || 0} POSTS
      </div>
      {results?.posts?.map((p, i) => (
        <div key={i} style={{ ...s.article, borderLeftColor: "#ff4400" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={s.badge("yellow")}>{p.subreddit}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{ fontSize: "10px", color: "#ff4400" }}>
                {p.score?.toLocaleString()} pts
              </span>
              <span style={{ fontSize: "10px", color: "#330000" }}>
                {p.comments} comments
              </span>
            </div>
          </div>
          <div style={{ fontSize: "12px", fontWeight: "bold", color: "#ff2222", marginBottom: "4px" }}>
            {p.title}
          </div>
          {p.selftext && (
            <div style={{ fontSize: "11px", color: "#552222", marginBottom: "6px" }}>
              {p.selftext.slice(0, 150)}...
            </div>
          )}
          {p.flair && (
            <span style={{ ...s.badge("red"), marginBottom: "6px", display: "inline-block" }}>
              {p.flair}
            </span>
          )}
          <div style={{ display: "flex", gap: "12px" }}>
            <a href={p.url} target="_blank" rel="noreferrer"
              style={{ fontSize: "11px", color: "#ff4400", textDecoration: "none" }}>
              VIEW POST
            </a>
            {p.external_url && p.external_url !== p.url && (
              <a href={p.external_url} target="_blank" rel="noreferrer"
                style={{ fontSize: "11px", color: "#882222", textDecoration: "none" }}>
                EXTERNAL LINK
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTwitter = () => (
    <div>
      {results?.error ? (
        <div style={s.section}>
          <div style={{ ...s.title, color: "#882222" }}>TWITTER STATUS</div>
          <div style={{ color: "#552222", fontSize: "11px" }}>{results.error}</div>
          <div style={{ color: "#440000", fontSize: "11px", marginTop: "8px" }}>
            Twitter API requires an approved developer account with elevated access.
            Using public Reddit and NewsAPI as alternative social monitoring.
          </div>
        </div>
      ) : (
        <div>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "12px" }}>
            TWITTER RESULTS — {results?.tweets?.length || 0} TWEETS
          </div>
          {results?.tweets?.map((t, i) => (
            <div key={i} style={s.article}>
              <div style={{ fontSize: "11px", color: "#ff2222", marginBottom: "6px" }}>
                {t.text}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ fontSize: "10px", color: "#ff4400" }}>
                  {t.likes} likes
                </span>
                <span style={{ fontSize: "10px", color: "#440000" }}>
                  {t.retweets} retweets
                </span>
                <span style={{ fontSize: "10px", color: "#330000" }}>
                  {formatDate(t.created)}
                </span>
              </div>
              <a href={t.url} target="_blank" rel="noreferrer"
                style={{ fontSize: "11px", color: "#ff4400", textDecoration: "none", display: "block", marginTop: "4px" }}>
                VIEW TWEET
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSentiment = () => (
    <div>
      {results?.basic && (
        <div style={s.section}>
          <div style={s.title}>BASIC SENTIMENT ANALYSIS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
            {[
              ["SENTIMENT", results.basic.sentiment],
              ["SCORE", `${results.basic.score}%`],
              ["POSITIVE SIGNALS", results.basic.positive_indicators],
              ["NEGATIVE SIGNALS", results.basic.negative_indicators],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: "8px", border: "1px solid #330000", background: "#0d0000" }}>
                <div style={{ color: "#ff4400", fontSize: "10px", marginBottom: "4px" }}>{k}</div>
                <div style={{
                  fontSize: "14px", fontWeight: "bold",
                  color: k === "SENTIMENT" ? getSentimentColor(String(v)) : "#ff2222"
                }}>
                  {String(v)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: "8px", background: "#0d0000", border: "1px solid #330000" }}>
            <div style={{
              height: "100%",
              width: `${results.basic.score}%`,
              background: getSentimentColor(results.basic.sentiment)
            }} />
          </div>
        </div>
      )}

      {results?.ai_analysis && (
        <div style={{ ...s.section, borderColor: "#ff0000" }}>
          <div style={s.title}>AI SENTIMENT ANALYSIS</div>
          <pre style={{ color: "#882222", fontSize: "11px",
            whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.6" }}>
            {results.ai_analysis}
          </pre>
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    if (!results) return null;
    switch (activeTab) {
      case "LIVE NEWS": return renderLiveNews();
      case "NEWS SEARCH": return renderNewsSearch();
      case "REDDIT FEED": return renderReddit();
      case "TWITTER MONITOR": return renderTwitter();
      case "SENTIMENT": return renderSentiment();
      default: return null;
    }
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
          NEWS MONITOR
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

        {/* Input Section */}
        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            {activeTab === "LIVE NEWS" ? "SELECT CATEGORY" :
             activeTab === "REDDIT FEED" ? "SUBREDDIT" :
             "SEARCH QUERY"}
          </div>

          {activeTab === "LIVE NEWS" && (
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{
                width: "100%", padding: "8px", marginBottom: "6px",
                background: "#060000", border: "1px solid #440000",
                color: "#882222", fontFamily: "Courier New", fontSize: "11px"
              }}>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          )}

          {activeTab === "REDDIT FEED" && (
            <input
              type="text"
              placeholder="e.g. worldnews, technology"
              value={subreddit}
              onChange={e => setSubreddit(e.target.value)}
              style={{
                width: "100%", marginBottom: "6px", background: "#060000",
                border: "1px solid #440000", borderLeft: "3px solid #ff0000",
                color: "#ff2222", fontFamily: "Courier New",
                fontSize: "11px", padding: "8px 12px"
              }}
            />
          )}

          {activeTab !== "LIVE NEWS" && activeTab !== "REDDIT FEED" && (
            <input
              type="text"
              placeholder={
                activeTab === "NEWS SEARCH" ? "Search any topic..." :
                activeTab === "TWITTER MONITOR" ? "Search tweets..." :
                "Enter text to analyze..."
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
          )}

          <button onClick={handleSearch} disabled={loading}
            style={{
              width: "100%", padding: "8px", marginTop: "6px",
              fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
              fontFamily: "Courier New",
              background: "#1a0000", border: "1px solid #ff0000", color: "#ff0000",
            }}>
            {loading ? "LOADING..." :
             activeTab === "LIVE NEWS" ? "LOAD NEWS FEED" :
             activeTab === "REDDIT FEED" ? "LOAD REDDIT" :
             "SEARCH"}
          </button>
        </div>

        {/* Quick Tests */}
        <div style={{ borderTop: "1px solid #220000" }} />
        <div style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px" }}>QUICK TESTS</div>
        {[
          { label: "Top Tech News", action: () => { setActiveTab("LIVE NEWS"); setCategory("technology"); }},
          { label: "Search AI News", action: () => { setActiveTab("NEWS SEARCH"); setInput("artificial intelligence"); }},
          { label: "r/worldnews", action: () => { setActiveTab("REDDIT FEED"); setSubreddit("worldnews"); }},
          { label: "r/cybersecurity", action: () => { setActiveTab("REDDIT FEED"); setSubreddit("cybersecurity"); }},
          { label: "Analyze: War", action: () => { setActiveTab("SENTIMENT"); setInput("war conflict attack"); }},
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
            <div style={{ color: "#440000", fontSize: "11px" }}>FEED LOADED</div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

          {!results && !loading && !error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", color: "#220000" }}>
              <div style={{ fontSize: "48px", color: "#1a0000", marginBottom: "16px" }}>[ * ]</div>
              <div style={{ fontSize: "13px", letterSpacing: "3px" }}>SELECT MODULE AND LOAD FEED</div>
              <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
                News / Reddit / Twitter / Sentiment
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "12px" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
                className="animate-pulse">
                SCANNING GLOBAL FEEDS...
              </div>
              <div style={{ color: "#440000", fontSize: "11px" }}>
                Aggregating intelligence from 1000+ sources
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px", border: "1px solid #ff0000", background: "#0d0000" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", marginBottom: "4px" }}>FEED ERROR</div>
              <div style={{ color: "#882222", fontSize: "11px" }}>{error}</div>
            </div>
          )}

          {!loading && renderResults()}
        </div>
      </div>
    </div>
  );
}
