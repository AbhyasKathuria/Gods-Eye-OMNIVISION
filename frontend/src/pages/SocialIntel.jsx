import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

const PLATFORM_ICONS = {
  "GitHub": "[ GH ]", "Instagram": "[ IG ]", "Twitter/X": "[ TW ]",
  "Reddit": "[ RD ]", "TikTok": "[ TK ]", "YouTube": "[ YT ]",
  "LinkedIn": "[ LI ]", "Facebook": "[ FB ]", "Pinterest": "[ PT ]",
  "Medium": "[ MD ]", "Dev.to": "[ DV ]", "Twitch": "[ TC ]",
  "Steam": "[ ST ]", "Spotify": "[ SP ]", "SoundCloud": "[ SC ]",
  "Behance": "[ BE ]", "Dribbble": "[ DR ]", "Gitlab": "[ GL ]",
  "Keybase": "[ KB ]", "Kaggle": "[ KG ]", "HackerNews": "[ HN ]",
  "Replit": "[ RP ]",
};

export default function SocialIntel() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("PERSON SEARCH");

  const handleSearch = async () => {
    const query = activeTab === "PERSON SEARCH" ? name : username;
    if (!query.trim()) return;
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      let res;
      if (activeTab === "PERSON SEARCH") {
        res = await axios.get(`${API}/social/person?name=${encodeURIComponent(name)}`);
      } else {
        res = await axios.get(`${API}/social/username/${encodeURIComponent(username)}`);
      }
      setResults(res.data.data || res.data);
    } catch (e) {
      setError(e.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  const s = {
    section: { marginBottom: "12px", padding: "12px", border: "1px solid #440000", background: "#060000" },
    title: { color: "#ff0000", fontSize: "11px", letterSpacing: "3px", marginBottom: "8px" },
    row: { fontSize: "11px", marginBottom: "4px" },
    label: { color: "#ff4400" },
    value: { color: "#882222" },
  };

  const renderPersonSearch = () => {
    if (!results) return null;
    const { github, reddit, linkedin, social_links, news, ai_summary } = results;

    return (
      <div>
        {/* AI Summary */}
        {ai_summary && (
          <div style={{ ...s.section, borderColor: "#ff0000" }}>
            <div style={s.title}>AI INTELLIGENCE SUMMARY</div>
            <pre style={{ color: "#882222", fontSize: "11px",
              whiteSpace: "pre-wrap", fontFamily: "Courier New", lineHeight: "1.6" }}>
              {ai_summary}
            </pre>
          </div>
        )}

        {/* LinkedIn Section */}
        <div style={{ ...s.section, borderColor: "#0077b5" }}>
          <div style={{ ...s.title, color: "#0077b5" }}>[ LI ] LINKEDIN INTELLIGENCE</div>

          {linkedin?.profiles?.length > 0 ? (
            <div>
              {linkedin.profiles.map((p, i) => (
                <div key={i} style={{ padding: "8px", marginBottom: "6px",
                  background: "#00050d", border: "1px solid #003355",
                  borderLeft: "2px solid #0077b5" }}>
                  <div style={{ color: "#0077b5", fontSize: "11px", marginBottom: "4px" }}>
                    PROFILE {i + 1} FOUND
                  </div>
                  <div style={{ color: "#336688", fontSize: "11px", marginBottom: "4px",
                    wordBreak: "break-all" }}>
                    {p.url}
                  </div>
                  <a href={p.url} target="_blank" rel="noreferrer"
                    style={{ color: "#0077b5", fontSize: "11px", textDecoration: "none" }}>
                    OPEN LINKEDIN PROFILE
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#336688", fontSize: "11px", marginBottom: "8px" }}>
              Direct profile not found automatically — use search below
            </div>
          )}

          {/* Google Search Link */}
          {linkedin?.search_url && (
            <div style={{ marginTop: "8px" }}>
              <div style={{ color: "#440000", fontSize: "10px", marginBottom: "4px" }}>
                SEARCH LINKEDIN MANUALLY:
              </div>
              <a href={linkedin.search_url} target="_blank" rel="noreferrer"
                style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none",
                  display: "block", padding: "6px 8px",
                  background: "#0d0000", border: "1px solid #330000" }}>
                GOOGLE: "{results.name}" site:linkedin.com
              </a>
            </div>
          )}

          {/* Also search Facebook */}
          <div style={{ marginTop: "8px" }}>
            <a href={`https://www.google.com/search?q=%22${encodeURIComponent(results.name)}%22+site%3Afacebook.com`}
              target="_blank" rel="noreferrer"
              style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none",
                display: "block", padding: "6px 8px", marginBottom: "4px",
                background: "#0d0000", border: "1px solid #330000" }}>
              GOOGLE: "{results.name}" site:facebook.com
            </a>
            <a href={`https://www.google.com/search?q=%22${encodeURIComponent(results.name)}%22+site%3Ainstagram.com`}
              target="_blank" rel="noreferrer"
              style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none",
                display: "block", padding: "6px 8px",
                background: "#0d0000", border: "1px solid #330000" }}>
              GOOGLE: "{results.name}" site:instagram.com
            </a>
          </div>
        </div>

        {/* Social Links Found */}
        {social_links?.length > 0 && (
          <div style={s.section}>
            <div style={s.title}>SOCIAL PROFILES FOUND — {social_links.length} PLATFORMS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px" }}>
              {social_links.map((link, i) => (
                <a key={i} href={link.profile_url} target="_blank" rel="noreferrer"
                  style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px", background: "#0d0000",
                    border: "1px solid #330000", borderLeft: "2px solid #ff0000",
                    cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1a0000"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0d0000"}>
                    <div style={{ color: "#ff4400", fontSize: "11px", marginBottom: "3px" }}>
                      {PLATFORM_ICONS[link.platform] || "[ ? ]"} {link.platform}
                    </div>
                    <div style={{ color: "#552222", fontSize: "10px" }}>@{link.username}</div>
                    <div style={{ color: "#330000", fontSize: "9px", marginTop: "3px" }}>CLICK TO VIEW</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* GitHub */}
        {github?.found && (
          <div style={s.section}>
            <div style={s.title}>[ GH ] GITHUB PROFILE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
              {[
                ["USERNAME", github.username],
                ["NAME", github.name],
                ["LOCATION", github.location],
                ["COMPANY", github.company],
                ["EMAIL", github.email],
                ["FOLLOWERS", github.followers],
                ["FOLLOWING", github.following],
                ["REPOS", github.public_repos],
                ["BLOG", github.blog],
                ["TWITTER", github.twitter],
              ].map(([k, v]) => v && (
                <div key={k} style={s.row}>
                  <span style={s.label}>{k}: </span>
                  <span style={s.value}>{String(v)}</span>
                </div>
              ))}
            </div>
            {github.bio && (
              <div style={{ ...s.row, marginBottom: "8px" }}>
                <span style={s.label}>BIO: </span>
                <span style={s.value}>{github.bio}</span>
              </div>
            )}
            {github.top_repos?.length > 0 && (
              <div>
                <div style={{ color: "#ff4400", fontSize: "10px", letterSpacing: "2px", marginBottom: "6px" }}>
                  TOP REPOSITORIES
                </div>
                {github.top_repos.map((repo, i) => (
                  <div key={i} style={{ padding: "6px 8px", marginBottom: "4px",
                    background: "#0d0000", border: "1px solid #220000" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <a href={repo.url} target="_blank" rel="noreferrer"
                        style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none" }}>
                        {repo.name}
                      </a>
                      <span style={{ color: "#440000", fontSize: "10px" }}>
                        ★ {repo.stars} {repo.language && `| ${repo.language}`}
                      </span>
                    </div>
                    {repo.description && (
                      <div style={{ color: "#552222", fontSize: "10px", marginTop: "2px" }}>
                        {repo.description?.slice(0, 80)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <a href={github.profile_url} target="_blank" rel="noreferrer"
              style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none",
                display: "block", marginTop: "8px" }}>
              VIEW FULL GITHUB PROFILE
            </a>
          </div>
        )}

        {/* Reddit */}
        {reddit?.found && (
          <div style={s.section}>
            <div style={s.title}>[ RD ] REDDIT PROFILE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {[
                ["USERNAME", reddit.username],
                ["TOTAL KARMA", reddit.karma],
                ["POST KARMA", reddit.post_karma],
                ["COMMENT KARMA", reddit.comment_karma],
              ].map(([k, v]) => v && (
                <div key={k} style={s.row}>
                  <span style={s.label}>{k}: </span>
                  <span style={s.value}>{String(v)}</span>
                </div>
              ))}
            </div>
            <a href={reddit.profile_url} target="_blank" rel="noreferrer"
              style={{ color: "#ff4400", fontSize: "11px", textDecoration: "none",
                display: "block", marginTop: "8px" }}>
              VIEW REDDIT PROFILE
            </a>
          </div>
        )}

        {/* News */}
        {news?.news_mentions?.length > 0 && (
          <div style={s.section}>
            <div style={s.title}>NEWS MENTIONS</div>
            {news.news_mentions.map((n, i) => (
              <div key={i} style={{ padding: "8px", marginBottom: "6px",
                background: "#0d0000", border: "1px solid #220000",
                borderLeft: "2px solid #ff4400" }}>
                <div style={{ color: "#ff2222", fontSize: "11px", marginBottom: "3px" }}>{n.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#440000", fontSize: "10px" }}>{n.source}</span>
                  <a href={n.url} target="_blank" rel="noreferrer"
                    style={{ color: "#ff4400", fontSize: "10px", textDecoration: "none" }}>
                    READ
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderUsernameSearch = () => {
    if (!results) return null;
    const found = results.results?.filter(r => r.found) || [];
    const notFound = results.results?.filter(r => !r.found) || [];

    return (
      <div>
        <div style={s.section}>
          <div style={s.title}>USERNAME SCAN — {found.length} PROFILES FOUND</div>
          <div style={{ fontSize: "11px", color: "#440000", marginBottom: "8px" }}>
            Scanned {results.results?.length || 0} platforms for @{results.username}
          </div>
        </div>

        {found.length > 0 && (
          <div style={s.section}>
            <div style={{ color: "#00aa44", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>
              FOUND ON {found.length} PLATFORMS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px" }}>
              {found.map((r, i) => (
                <a key={i} href={r.profile_url} target="_blank" rel="noreferrer"
                  style={{ textDecoration: "none" }}>
                  <div style={{ padding: "8px", background: "#001a00",
                    border: "1px solid #004400", borderLeft: "2px solid #00aa44",
                    cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#003300"}
                    onMouseLeave={e => e.currentTarget.style.background = "#001a00"}>
                    <div style={{ color: "#00aa44", fontSize: "11px", marginBottom: "3px" }}>
                      {PLATFORM_ICONS[r.platform] || "[ ? ]"} {r.platform}
                    </div>
                    <div style={{ color: "#006600", fontSize: "9px" }}>PROFILE EXISTS</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {notFound.length > 0 && (
          <div style={s.section}>
            <div style={{ color: "#440000", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>
              NOT FOUND ON {notFound.length} PLATFORMS
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {notFound.map((r, i) => (
                <div key={i} style={{ padding: "4px 8px", fontSize: "10px",
                  background: "#0d0000", border: "1px solid #220000", color: "#330000" }}>
                  {r.platform}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
          SOCIAL INTEL
        </div>

        {["PERSON SEARCH", "USERNAME SCAN"].map(tab => (
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

        <div>
          <div style={{ color: "#882222", fontSize: "11px", marginBottom: "6px", letterSpacing: "1px" }}>
            {activeTab === "PERSON SEARCH" ? "FULL NAME" : "USERNAME"}
          </div>
          <input
            type="text"
            placeholder={activeTab === "PERSON SEARCH" ? "e.g. Elon Musk" : "e.g. elonmusk"}
            value={activeTab === "PERSON SEARCH" ? name : username}
            onChange={e => activeTab === "PERSON SEARCH" ? setName(e.target.value) : setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            style={{
              width: "100%", background: "#060000",
              border: "1px solid #440000", borderLeft: "3px solid #ff0000",
              color: "#ff2222", fontFamily: "Courier New",
              fontSize: "11px", padding: "8px 12px"
            }}
          />
          <button onClick={handleSearch} disabled={loading}
            style={{
              width: "100%", padding: "8px", marginTop: "6px",
              fontSize: "11px", letterSpacing: "1px", cursor: "pointer",
              fontFamily: "Courier New",
              background: "#1a0000", border: "1px solid #ff0000", color: "#ff0000",
            }}>
            {loading ? "SCANNING..." : "SEARCH"}
          </button>
        </div>

        <div style={{ borderTop: "1px solid #220000" }} />
        <div style={{ color: "#882222", fontSize: "11px", letterSpacing: "1px" }}>QUICK TESTS</div>
        {[
          { label: "Elon Musk", action: () => { setActiveTab("PERSON SEARCH"); setName("Elon Musk"); }},
          { label: "Sundar Pichai", action: () => { setActiveTab("PERSON SEARCH"); setName("Sundar Pichai"); }},
          { label: "Narendra Modi", action: () => { setActiveTab("PERSON SEARCH"); setName("Narendra Modi"); }},
          { label: "@torvalds", action: () => { setActiveTab("USERNAME SCAN"); setUsername("torvalds"); }},
          { label: "@nasa", action: () => { setActiveTab("USERNAME SCAN"); setUsername("nasa"); }},
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
          Scans GitHub, Reddit, LinkedIn + 18 more platforms. Only public data.
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #330000",
          background: "#060000", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}>
            {activeTab}
          </div>
          {results && <div style={{ color: "#440000", fontSize: "11px" }}>SCAN COMPLETE</div>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {!results && !loading && !error && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", color: "#220000" }}>
              <div style={{ fontSize: "48px", color: "#1a0000", marginBottom: "16px" }}>[ S ]</div>
              <div style={{ fontSize: "13px", letterSpacing: "3px" }}>ENTER NAME OR USERNAME</div>
              <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
                Searches LinkedIn, GitHub, Reddit, Instagram + 17 more
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: "12px" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
                className="animate-pulse">
                SCANNING SOCIAL NETWORKS...
              </div>
              <div style={{ color: "#440000", fontSize: "11px" }}>
                Checking LinkedIn, GitHub, Reddit + 18 more platforms
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "12px", border: "1px solid #ff0000", background: "#0d0000" }}>
              <div style={{ color: "#ff0000", fontSize: "11px", marginBottom: "4px" }}>SCAN ERROR</div>
              <div style={{ color: "#882222", fontSize: "11px" }}>{error}</div>
            </div>
          )}

          {!loading && results && (
            activeTab === "PERSON SEARCH" ? renderPersonSearch() : renderUsernameSearch()
          )}
        </div>
      </div>
    </div>
  );
}
