const hotspots = [
  { cx: 88, cy: 110, label: "TARGET", delay: "0s" },
  { cx: 157, cy: 88, label: "BREACH", delay: "0.4s" },
  { cx: 215, cy: 100, label: "THREAT", delay: "0.3s" },
  { cx: 162, cy: 137, label: "ACTIVE", delay: "0.6s" },
  { cx: 100, cy: 180, label: "ALERT", delay: "0.2s" },
  { cx: 225, cy: 168, label: "TARGET", delay: "0.9s" },
];

const threatLines = [
  { x1: 88, y1: 110, x2: 157, y2: 88, delay: "0s" },
  { x1: 215, y1: 100, x2: 225, y2: 168, delay: "0.5s" },
  { x1: 100, y1: 180, x2: 162, y2: 137, delay: "0.3s" },
];

export default function Globe3D() {
  return (
    <div className="flex-1 flex items-center justify-center relative w-full">
      <svg
        width="310"
        height="310"
        viewBox="0 0 300 300"
        style={{ overflow: "visible" }}
      >
        <defs>
          <style>{`
            @keyframes expandRing {
              0% { r: 8; opacity: 1; stroke-width: 2; }
              100% { r: 155; opacity: 0; stroke-width: 0.2; }
            }
            @keyframes hotpulse {
              0%,100% { opacity: 1; }
              50% { opacity: 0.2; }
            }
            @keyframes corePulse {
              0%,100% { r: 6; opacity: 1; }
              50% { r: 10; opacity: 0.6; }
            }
            @keyframes sweep {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes outerPulse {
              0%,100% { stroke-width: 1.5; stroke: #ff0000; }
              50% { stroke-width: 3; stroke: #ff4400; }
            }
            @keyframes threatblink {
              0%,100% { opacity: 0.8; }
              50% { opacity: 0.1; }
            }
            .ring { fill: none; animation: expandRing 2.5s ease-out infinite; }
            .ring1 { stroke: #ff0000; animation-delay: 0s; }
            .ring2 { stroke: #ff4400; animation-delay: 0.8s; }
            .ring3 { stroke: #ff0000; animation-delay: 1.6s; }
            .ring4 { stroke: #cc0000; animation-delay: 0.4s; }
            .hot { animation: hotpulse 0.8s infinite; }
            .core { animation: corePulse 0.5s infinite; }
            .radar-sweep { transform-origin: 150px 150px; animation: sweep 3s linear infinite; }
            .globe-outer { animation: outerPulse 2s ease-in-out infinite; }
            .threat-line { animation: threatblink 1s infinite; }
          `}</style>
        </defs>

        {/* Expanding rings */}
        <circle className="ring ring1" cx="150" cy="150" r="8" />
        <circle className="ring ring2" cx="150" cy="150" r="8" />
        <circle className="ring ring3" cx="150" cy="150" r="8" />
        <circle className="ring ring4" cx="150" cy="150" r="8" />

        {/* Globe body */}
        <circle cx="150" cy="150" r="135" fill="none" stroke="#220000" strokeWidth="8" />
        <circle cx="150" cy="150" r="132" fill="none" stroke="#440000" strokeWidth="3" />
        <circle className="globe-outer" cx="150" cy="150" r="128" fill="#020000" />

        {/* Latitude lines */}
        {[25, 55, 85, 108].map((ry, i) => (
          <ellipse key={i} cx="150" cy="150" rx="128" ry={ry} fill="none" stroke="#330000" strokeWidth="0.7" />
        ))}
        <line x1="22" y1="150" x2="278" y2="150" stroke="#330000" strokeWidth="0.7" />

        {/* Longitude lines */}
        {[25, 55, 85, 108].map((rx, i) => (
          <ellipse key={i} cx="150" cy="150" rx={rx} ry="128" fill="none" stroke="#2a0000" strokeWidth="0.5" />
        ))}
        <line x1="150" y1="22" x2="150" y2="278" stroke="#330000" strokeWidth="0.7" />

        {/* Continents */}
        <path d="M55,85 L92,72 L115,82 L125,105 L115,138 L88,148 L65,135 L50,112 Z" fill="#1a0000" stroke="#ff2200" strokeWidth="1.2" />
        <path d="M138,72 L168,67 L180,80 L174,98 L155,104 L138,97 Z" fill="#1a0000" stroke="#ff2200" strokeWidth="1.2" />
        <path d="M143,108 L172,102 L185,124 L180,162 L162,173 L143,162 L135,138 Z" fill="#1a0000" stroke="#ff2200" strokeWidth="1.2" />
        <path d="M178,72 L238,67 L252,92 L246,125 L218,136 L190,130 L175,112 Z" fill="#1a0000" stroke="#ff2200" strokeWidth="1.2" />
        <path d="M85,155 L118,148 L124,175 L113,208 L96,213 L80,192 L77,168 Z" fill="#1a0000" stroke="#ff2200" strokeWidth="1.2" />
        <path d="M208,158 L242,152 L251,174 L237,187 L209,183 Z" fill="#1a0000" stroke="#ff2200" strokeWidth="1.2" />

        {/* Radar sweep */}
        <g className="radar-sweep">
          <path d="M150,150 L150,22" stroke="#ff000055" strokeWidth="1.5" />
          <path d="M150,150 L278,150" stroke="#ff000011" strokeWidth="1" />
          <path d="M150,150 L260,90" stroke="#ff000033" strokeWidth="0.8" />
        </g>

        {/* Threat lines */}
        {threatLines.map((l, i) => (
          <line key={i} className="threat-line" x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#ff4400" strokeWidth="0.8" style={{ animationDelay: l.delay }} />
        ))}

        {/* Hotspots */}
        {hotspots.map((h, i) => (
          <g key={i}>
            <circle className="hot" cx={h.cx} cy={h.cy} r="4" fill="#ff0000"
              style={{ animationDelay: h.delay }} />
            <circle cx={h.cx} cy={h.cy} r="9" fill="none" stroke="#ff000055" strokeWidth="1" />
            <text x={h.cx + 6} y={h.cy - 6} fill="#ff4400" fontSize="7"
              fontFamily="Courier New">{h.label}</text>
          </g>
        ))}

        {/* Core */}
        <circle cx="150" cy="150" r="18" fill="none" stroke="#ff000033" strokeWidth="1" />
        <circle cx="150" cy="150" r="12" fill="none" stroke="#ff000055" strokeWidth="1" />
        <circle className="core" cx="150" cy="150" r="6" fill="#ff0000" />

        <text x="150" y="240" textAnchor="middle" fill="#330000"
          fontSize="8" fontFamily="Courier New" letterSpacing="4">
          OMNIVISION ACTIVE
        </text>
      </svg>
    </div>
  );
}
