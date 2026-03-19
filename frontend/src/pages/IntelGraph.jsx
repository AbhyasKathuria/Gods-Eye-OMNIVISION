import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:8000";

// Node types and their colors
const NODE_COLORS = {
  person: "#ff0000",
  email: "#ff4400",
  domain: "#ff8800",
  ip: "#ffaa00",
  username: "#ff2200",
  breach: "#cc0000",
  location: "#ff6600",
  phone: "#ff3300",
  organization: "#ff5500",
  center: "#ff0000",
};

const NODE_ICONS = {
  person: "[ P ]",
  email: "[ @ ]",
  domain: "[ D ]",
  ip: "[ IP ]",
  username: "[ U ]",
  breach: "[ ! ]",
  location: "[ L ]",
  phone: "[ # ]",
  organization: "[ O ]",
  center: "[ T ]",
};

function buildGraph(target, type, aiData) {
  const nodes = [];
  const edges = [];
  const cx = 500, cy = 300;

  // Center node
  nodes.push({ id: "center", label: target, type: "center", x: cx, y: cy, size: 28 });

  if (type === "person") {
    const branches = [
      { id: "n1", label: "NewsAPI Mentions", type: "domain", angle: 0 },
      { id: "n2", label: "Reddit Posts", type: "username", angle: 45 },
      { id: "n3", label: "Social Media", type: "person", angle: 90 },
      { id: "n4", label: "Public Records", type: "organization", angle: 135 },
      { id: "n5", label: "Image Search", type: "location", angle: 180 },
      { id: "n6", label: "Email Addresses", type: "email", angle: 225 },
      { id: "n7", label: "AI OSINT Report", type: "breach", angle: 270 },
      { id: "n8", label: "Digital Footprint", type: "ip", angle: 315 },
    ];
    branches.forEach(b => {
      const r = 180;
      const rad = (b.angle * Math.PI) / 180;
      nodes.push({ ...b, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), size: 20 });
      edges.push({ from: "center", to: b.id });
    });
    // Add sub-nodes
    const subNodes = [
      { id: "s1", label: "LinkedIn", type: "person", parentId: "n3", angle: 60, r: 100 },
      { id: "s2", label: "Twitter/X", type: "username", parentId: "n3", angle: 90, r: 100 },
      { id: "s3", label: "Instagram", type: "person", parentId: "n3", angle: 120, r: 100 },
      { id: "s4", label: "Breach DB", type: "breach", parentId: "n6", angle: 200, r: 100 },
      { id: "s5", label: "GDELT Events", type: "domain", parentId: "n1", angle: 340, r: 100 },
    ];
    subNodes.forEach(s => {
      const parent = nodes.find(n => n.id === s.parentId);
      if (parent) {
        const rad = (s.angle * Math.PI) / 180;
        nodes.push({ ...s, x: parent.x + s.r * Math.cos(rad), y: parent.y + s.r * Math.sin(rad), size: 14 });
        edges.push({ from: s.parentId, to: s.id });
      }
    });
  }

  if (type === "ip") {
    const branches = [
      { id: "n1", label: "Geolocation", type: "location", angle: 0 },
      { id: "n2", label: "AbuseIPDB", type: "breach", angle: 51 },
      { id: "n3", label: "VirusTotal", type: "breach", angle: 102 },
      { id: "n4", label: "Shodan Devices", type: "ip", angle: 153 },
      { id: "n5", label: "ISP / ASN", type: "organization", angle: 204 },
      { id: "n6", label: "Reverse DNS", type: "domain", angle: 255 },
      { id: "n7", label: "Open Ports", type: "ip", angle: 306 },
    ];
    branches.forEach(b => {
      const r = 180;
      const rad = (b.angle * Math.PI) / 180;
      nodes.push({ ...b, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), size: 20 });
      edges.push({ from: "center", to: b.id });
    });
    const subNodes = [
      { id: "s1", label: "Country / City", type: "location", parentId: "n1", angle: 340, r: 110 },
      { id: "s2", label: "Abuse Reports", type: "breach", parentId: "n2", angle: 30, r: 110 },
      { id: "s3", label: "Malware Tags", type: "breach", parentId: "n3", angle: 80, r: 110 },
      { id: "s4", label: "Device List", type: "ip", parentId: "n4", angle: 130, r: 110 },
      { id: "s5", label: "Hostname", type: "domain", parentId: "n6", angle: 240, r: 110 },
    ];
    subNodes.forEach(s => {
      const parent = nodes.find(n => n.id === s.parentId);
      if (parent) {
        const rad = (s.angle * Math.PI) / 180;
        nodes.push({ ...s, x: parent.x + s.r * Math.cos(rad), y: parent.y + s.r * Math.sin(rad), size: 14 });
        edges.push({ from: s.parentId, to: s.id });
      }
    });
  }

  if (type === "domain") {
    const branches = [
      { id: "n1", label: "WHOIS Data", type: "organization", angle: 0 },
      { id: "n2", label: "DNS Records", type: "ip", angle: 60 },
      { id: "n3", label: "VirusTotal", type: "breach", angle: 120 },
      { id: "n4", label: "URLScan", type: "domain", angle: 180 },
      { id: "n5", label: "SSL Certificate", type: "organization", angle: 240 },
      { id: "n6", label: "Subdomains", type: "domain", angle: 300 },
    ];
    branches.forEach(b => {
      const r = 180;
      const rad = (b.angle * Math.PI) / 180;
      nodes.push({ ...b, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), size: 20 });
      edges.push({ from: "center", to: b.id });
    });
    const subNodes = [
      { id: "s1", label: "Registrar", type: "organization", parentId: "n1", angle: 330, r: 110 },
      { id: "s2", label: "Creation Date", type: "organization", parentId: "n1", angle: 30, r: 110 },
      { id: "s3", label: "A Records", type: "ip", parentId: "n2", angle: 40, r: 110 },
      { id: "s4", label: "MX Records", type: "email", parentId: "n2", angle: 80, r: 110 },
      { id: "s5", label: "Malicious Score", type: "breach", parentId: "n3", angle: 100, r: 110 },
      { id: "s6", label: "Screenshot", type: "domain", parentId: "n4", angle: 160, r: 110 },
    ];
    subNodes.forEach(s => {
      const parent = nodes.find(n => n.id === s.parentId);
      if (parent) {
        const rad = (s.angle * Math.PI) / 180;
        nodes.push({ ...s, x: parent.x + s.r * Math.cos(rad), y: parent.y + s.r * Math.sin(rad), size: 14 });
        edges.push({ from: s.parentId, to: s.id });
      }
    });
  }

  if (type === "email") {
    const branches = [
      { id: "n1", label: "LeakCheck.io", type: "breach", angle: 0 },
      { id: "n2", label: "BreachDirectory", type: "breach", angle: 72 },
      { id: "n3", label: "Domain Extract", type: "domain", angle: 144 },
      { id: "n4", label: "Username Guess", type: "username", angle: 216 },
      { id: "n5", label: "Social Search", type: "person", angle: 288 },
    ];
    branches.forEach(b => {
      const r = 180;
      const rad = (b.angle * Math.PI) / 180;
      nodes.push({ ...b, x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad), size: 20 });
      edges.push({ from: "center", to: b.id });
    });
    const subNodes = [
      { id: "s1", label: "Breach Names", type: "breach", parentId: "n1", angle: 340, r: 110 },
      { id: "s2", label: "Leaked Passwords", type: "breach", parentId: "n2", angle: 50, r: 110 },
      { id: "s3", label: "WHOIS Lookup", type: "organization", parentId: "n3", angle: 120, r: 110 },
      { id: "s4", label: "Platform Accounts", type: "username", parentId: "n4", angle: 200, r: 110 },
    ];
    subNodes.forEach(s => {
      const parent = nodes.find(n => n.id === s.parentId);
      if (parent) {
        const rad = (s.angle * Math.PI) / 180;
        nodes.push({ ...s, x: parent.x + s.r * Math.cos(rad), y: parent.y + s.r * Math.sin(rad), size: 14 });
        edges.push({ from: s.parentId, to: s.id });
      }
    });
  }

  return { nodes, edges };
}

export default function IntelGraph() {
  const svgRef = useRef(null);
  const [target, setTarget] = useState("");
  const [type, setType] = useState("person");
  const [graph, setGraph] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodeCount, setNodeCount] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);

  const buildAndAnimate = () => {
    if (!target.trim()) return;
    setLoading(true);
    setSelected(null);
    setTimeout(() => {
      const g = buildGraph(target.trim(), type, null);
      setGraph(g);
      setNodeCount(g.nodes.length);
      setEdgeCount(g.edges.length);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setLoading(false);
    }, 800);
  };

  const handleMouseDown = (e) => {
    if (e.target.tagName === "svg" || e.target.tagName === "rect") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const handleMouseMove = (e) => {
    if (isDragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
  };

  const TYPES = ["person", "ip", "domain", "email"];

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#000000" }}>

      {/* Left Panel */}
      <div style={{ width: "240px", padding: "12px", borderRight: "1px solid #440000",
        background: "#030000", display: "flex", flexDirection: "column", gap: "10px", overflowY: "auto" }}>

        <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px",
          paddingBottom: "8px", borderBottom: "1px solid #440000" }}>
          INTELLIGENCE GRAPH
        </div>

        <div style={{ color: "#552222", fontSize: "10px", lineHeight: "1.5" }}>
          Visualize relationships between entities. Map how data connects across sources.
        </div>

        <div>
          <div style={{ color: "#882222", fontSize: "10px", marginBottom: "6px" }}>INVESTIGATION TYPE</div>
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              style={{ width: "100%", padding: "7px", marginBottom: "4px", fontSize: "10px",
                letterSpacing: "1px", cursor: "pointer", fontFamily: "Courier New", textAlign: "left",
                background: type === t ? "#1a0000" : "#060000",
                border: `1px solid ${type === t ? "#ff0000" : "#330000"}`,
                color: type === t ? "#ff0000" : "#552222" }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div>
          <div style={{ color: "#882222", fontSize: "10px", marginBottom: "6px" }}>TARGET</div>
          <input type="text" value={target} onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && buildAndAnimate()}
            placeholder={type === "person" ? "e.g. Elon Musk" : type === "ip" ? "e.g. 8.8.8.8" :
              type === "domain" ? "e.g. google.com" : "e.g. user@email.com"}
            style={{ width: "100%", background: "#060000", border: "1px solid #440000",
              borderLeft: "3px solid #ff0000", color: "#ff2222", fontFamily: "Courier New",
              fontSize: "11px", padding: "8px 10px" }} />
          <button onClick={buildAndAnimate} disabled={!target.trim() || loading}
            style={{ width: "100%", padding: "8px", marginTop: "6px", fontSize: "11px",
              letterSpacing: "1px", cursor: "pointer", fontFamily: "Courier New",
              background: target ? "#1a0000" : "#060000",
              border: `1px solid ${target ? "#ff0000" : "#440000"}`,
              color: target ? "#ff0000" : "#662222" }}>
            {loading ? "BUILDING GRAPH..." : "BUILD GRAPH"}
          </button>
        </div>

        {/* Zoom controls */}
        {graph && (
          <>
            <div style={{ borderTop: "1px solid #220000" }} />
            <div style={{ color: "#882222", fontSize: "10px", marginBottom: "4px" }}>CONTROLS</div>
            <div style={{ display: "flex", gap: "4px" }}>
              {[
                { label: "ZOOM +", action: () => setZoom(z => Math.min(3, z + 0.2)) },
                { label: "ZOOM -", action: () => setZoom(z => Math.max(0.3, z - 0.2)) },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action}
                  style={{ flex: 1, padding: "5px", fontSize: "9px", cursor: "pointer",
                    fontFamily: "Courier New", background: "#060000",
                    border: "1px solid #330000", color: "#552222" }}>
                  {btn.label}
                </button>
              ))}
            </div>
            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              style={{ width: "100%", padding: "5px", fontSize: "9px", cursor: "pointer",
                fontFamily: "Courier New", background: "#060000",
                border: "1px solid #330000", color: "#552222" }}>
              RESET VIEW
            </button>
            <div style={{ color: "#330000", fontSize: "9px" }}>
              Drag to pan • Scroll to zoom • Click node for details
            </div>
          </>
        )}

        {/* Stats */}
        {graph && (
          <>
            <div style={{ borderTop: "1px solid #220000" }} />
            <div style={{ color: "#882222", fontSize: "10px", marginBottom: "4px" }}>GRAPH STATS</div>
            {[
              ["NODES", nodeCount],
              ["EDGES", edgeCount],
              ["TYPE", type.toUpperCase()],
              ["TARGET", target.slice(0, 16)],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between",
                fontSize: "10px", marginBottom: "3px" }}>
                <span style={{ color: "#440000" }}>{k}</span>
                <span style={{ color: "#ff4400" }}>{v}</span>
              </div>
            ))}
          </>
        )}

        {/* Legend */}
        <div style={{ borderTop: "1px solid #220000" }} />
        <div style={{ color: "#882222", fontSize: "10px", marginBottom: "4px" }}>LEGEND</div>
        {Object.entries(NODE_COLORS).filter(([k]) => k !== "center").slice(0, 6).map(([type, color]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: "6px",
            marginBottom: "3px", fontSize: "10px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%",
              background: color, border: `1px solid ${color}` }} />
            <span style={{ color: "#552222" }}>{type.toUpperCase()}</span>
          </div>
        ))}
      </div>

      {/* Graph Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#000000" }}>

        {/* Header */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
          padding: "8px 16px", background: "rgba(0,0,0,0.8)",
          borderBottom: "1px solid #330000", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "2px" }}>
            {graph ? `${target.toUpperCase()} — INTELLIGENCE MAP` : "INTELLIGENCE GRAPH"}
          </div>
          {graph && (
            <div style={{ color: "#440000", fontSize: "10px" }}>
              {nodeCount} NODES · {edgeCount} CONNECTIONS
            </div>
          )}
        </div>

        {/* Empty state */}
        {!graph && !loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", color: "#220000" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>[ G ]</div>
            <div style={{ fontSize: "13px", letterSpacing: "3px" }}>ENTER TARGET TO BUILD GRAPH</div>
            <div style={{ fontSize: "11px", marginTop: "8px", color: "#150000" }}>
              Visualize intelligence relationships between entities
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", gap: "12px" }}>
            <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "3px" }}
              className="animate-pulse">
              MAPPING INTELLIGENCE CONNECTIONS...
            </div>
          </div>
        )}

        {/* SVG Graph */}
        {graph && !loading && (
          <svg ref={svgRef} width="100%" height="100%"
            style={{ cursor: isDragging ? "grabbing" : "grab", marginTop: "36px" }}
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            onWheel={handleWheel}>

            <defs>
              <style>{`
                @keyframes nodePulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
                @keyframes edgeDraw { from{stroke-dashoffset:1000} to{stroke-dashoffset:0} }
                .node-center { animation: nodePulse 1.5s infinite; }
                .edge-line { stroke-dasharray: 1000; animation: edgeDraw 1s ease forwards; }
              `}</style>
              <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0a0000" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Background */}
            <rect width="100%" height="100%" fill="url(#bgGrad)" />

            {/* Grid */}
            <g opacity="0.05">
              {Array.from({ length: 30 }, (_, i) => (
                <line key={`v${i}`} x1={i * 60} y1="0" x2={i * 60} y2="2000" stroke="#ff0000" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 20 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 60} x2="3000" y2={i * 60} stroke="#ff0000" strokeWidth="0.5" />
              ))}
            </g>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>

              {/* Edges */}
              {graph.edges.map((edge, i) => {
                const from = graph.nodes.find(n => n.id === edge.from);
                const to = graph.nodes.find(n => n.id === edge.to);
                if (!from || !to) return null;
                const isConnectedToSelected = selected &&
                  (edge.from === selected.id || edge.to === selected.id);
                return (
                  <line key={i} className="edge-line"
                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={isConnectedToSelected ? "#ff4400" : "#ff000033"}
                    strokeWidth={isConnectedToSelected ? 1.5 : 0.8}
                    style={{ animationDelay: `${i * 0.05}s` }} />
                );
              })}

              {/* Nodes */}
              {graph.nodes.map((node, i) => {
                const color = NODE_COLORS[node.type] || "#ff0000";
                const isSelected = selected?.id === node.id;
                const isCenter = node.id === "center";
                return (
                  <g key={node.id} onClick={() => setSelected(isSelected ? null : node)}
                    style={{ cursor: "pointer" }}
                    className={isCenter ? "node-center" : ""}>
                    {/* Outer glow ring */}
                    <circle cx={node.x} cy={node.y} r={node.size + 8}
                      fill="none" stroke={color}
                      strokeWidth={isSelected ? 2 : 0.5}
                      opacity={isSelected ? 0.8 : 0.2} />
                    {/* Main circle */}
                    <circle cx={node.x} cy={node.y} r={node.size}
                      fill={isSelected ? color : "#0a0000"}
                      stroke={color} strokeWidth={isSelected ? 2 : 1}
                      filter={isCenter ? "url(#glow)" : undefined} />
                    {/* Icon text */}
                    <text x={node.x} y={node.y - 2} textAnchor="middle"
                      dominantBaseline="middle" fill={color}
                      fontSize={node.size * 0.55} fontFamily="Courier New">
                      {NODE_ICONS[node.type] || "[ ]"}
                    </text>
                    {/* Label */}
                    <text x={node.x} y={node.y + node.size + 12} textAnchor="middle"
                      fill={isSelected ? "#ff4400" : "#662222"}
                      fontSize={node.size > 18 ? 11 : 9} fontFamily="Courier New">
                      {node.label.length > 14 ? node.label.slice(0, 14) + ".." : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {/* Selected Node Info Panel */}
        {selected && (
          <div style={{ position: "absolute", bottom: "16px", right: "16px",
            width: "220px", background: "#060000", border: "1px solid #ff0000",
            padding: "12px", zIndex: 20 }}>
            <div style={{ color: "#ff0000", fontSize: "11px", letterSpacing: "2px", marginBottom: "8px" }}>
              NODE DETAILS
            </div>
            <div style={{ fontSize: "10px", marginBottom: "4px" }}>
              <span style={{ color: "#ff4400" }}>LABEL: </span>
              <span style={{ color: "#882222" }}>{selected.label}</span>
            </div>
            <div style={{ fontSize: "10px", marginBottom: "4px" }}>
              <span style={{ color: "#ff4400" }}>TYPE: </span>
              <span style={{ color: "#882222" }}>{selected.type.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: "10px", marginBottom: "8px" }}>
              <span style={{ color: "#ff4400" }}>CONNECTIONS: </span>
              <span style={{ color: "#882222" }}>
                {graph.edges.filter(e => e.from === selected.id || e.to === selected.id).length}
              </span>
            </div>
            <button onClick={() => setSelected(null)}
              style={{ width: "100%", padding: "4px", fontSize: "9px", cursor: "pointer",
                fontFamily: "Courier New", background: "#0d0000",
                border: "1px solid #440000", color: "#552222" }}>
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
