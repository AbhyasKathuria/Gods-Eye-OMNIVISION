import { useEffect, useRef, useState } from "react";

export default function GodsEyeLogo({ size = 48, showText = false }) {
  const svgRef = useRef(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // Cursor tracking
    const handleMouseMove = (e) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const angle = Math.atan2(dy, dx);
      const maxRadius = 6;
      const dist = Math.min(Math.sqrt(dx * dx + dy * dy), 80);
      const factor = dist / 80;
      setPupilPos({
        x: Math.cos(angle) * maxRadius * factor,
        y: Math.sin(angle) * maxRadius * factor,
      });
    };

    // Blinking
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3500);

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(blinkInterval);
    };
  }, []);

  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.44;

  // Eye dimensions
  const eyeW = r * 0.85;
  const eyeH = r * 0.42;
  const pupilR = r * 0.14;
  const irisR = r * 0.22;

  // Blink: eyelid closes
  const lidY = isBlinking ? cy : cy - eyeH;
  const eyePath = `M ${cx - eyeW} ${cy}
    Q ${cx} ${cy - eyeH} ${cx + eyeW} ${cy}
    Q ${cx} ${cy + eyeH} ${cx - eyeW} ${cy} Z`;
  const topLidPath = isBlinking
    ? `M ${cx - eyeW} ${cy} Q ${cx} ${cy + eyeH * 0.5} ${cx + eyeW} ${cy}`
    : `M ${cx - eyeW} ${cy} Q ${cx} ${cy - eyeH} ${cx + eyeW} ${cy}`;

  return (
    <svg
      ref={svgRef}
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{ overflow: "visible", cursor: "crosshair" }}
    >
      <defs>
        <style>{`
          @keyframes ringExpand {
            0% { r: ${r * 0.1}; opacity: 0.9; stroke-width: 1.5; }
            100% { r: ${r * 1.1}; opacity: 0; stroke-width: 0.2; }
          }
          @keyframes radarSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes outerPulse {
            0%,100% { stroke: #ff0000; stroke-width: 1.2; }
            50% { stroke: #ff4400; stroke-width: 2; }
          }
          @keyframes corePulse {
            0%,100% { r: ${pupilR * 0.4}; opacity: 1; }
            50% { r: ${pupilR * 0.6}; opacity: 0.6; }
          }
          .ring-exp { fill: none; animation: ringExpand 2.5s ease-out infinite; }
          .r1 { stroke: #ff0000; animation-delay: 0s; }
          .r2 { stroke: #ff4400; animation-delay: 0.8s; }
          .r3 { stroke: #ff0000; animation-delay: 1.6s; }
          .radar-g { transform-origin: ${cx}px ${cy}px; animation: radarSpin 4s linear infinite; }
          .globe-ring { animation: outerPulse 2s ease-in-out infinite; }
          .core-dot { animation: corePulse 0.5s infinite; }
          .eye-clip { clip-path: url(#eyeClip); }
        `}</style>

        <clipPath id={`eyeClip-${s}`}>
          <path d={eyePath} />
        </clipPath>
      </defs>

      {/* Expanding danger rings */}
      <circle className="ring-exp r1" cx={cx} cy={cy} r={r * 0.1} />
      <circle className="ring-exp r2" cx={cx} cy={cy} r={r * 0.1} />
      <circle className="ring-exp r3" cx={cx} cy={cy} r={r * 0.1} />

      {/* Globe outer rings */}
      <circle cx={cx} cy={cy} r={r * 1.05} fill="none" stroke="#220000" strokeWidth={s * 0.06} />
      <circle cx={cx} cy={cy} r={r} fill="#020000" className="globe-ring" stroke="#ff0000" strokeWidth="1" />

      {/* Globe latitude/longitude lines */}
      {[0.25, 0.55, 0.8].map((ry, i) => (
        <ellipse key={`lat-${i}`} cx={cx} cy={cy} rx={r} ry={r * ry}
          fill="none" stroke="#330000" strokeWidth="0.4" />
      ))}
      {[0.3, 0.6, 0.85].map((rx, i) => (
        <ellipse key={`lon-${i}`} cx={cx} cy={cy} rx={r * rx} ry={r}
          fill="none" stroke="#2a0000" strokeWidth="0.3" />
      ))}
      <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#330000" strokeWidth="0.4" />
      <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#330000" strokeWidth="0.4" />

      {/* Radar sweep inside globe */}
      <g className="radar-g">
        <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.9}
          stroke="#ff000044" strokeWidth="1" />
        <line x1={cx} y1={cy} x2={cx + r * 0.7} y2={cy - r * 0.5}
          stroke="#ff000022" strokeWidth="0.8" />
      </g>

      {/* Eye shape - clipped inside globe */}
      <g clipPath={`url(#eyeClip-${s})`}>
        {/* Eye white / iris background */}
        <ellipse cx={cx} cy={cy} rx={eyeW} ry={eyeH}
          fill="#0a0000" stroke="#ff2200" strokeWidth="0.8" />

        {/* Iris */}
        <circle cx={cx + pupilPos.x} cy={cy + pupilPos.y}
          r={irisR} fill="#1a0000" stroke="#ff0000" strokeWidth="0.8" />

        {/* Iris detail rings */}
        <circle cx={cx + pupilPos.x} cy={cy + pupilPos.y}
          r={irisR * 0.7} fill="none" stroke="#ff000055" strokeWidth="0.5" />
        <circle cx={cx + pupilPos.x} cy={cy + pupilPos.y}
          r={irisR * 0.4} fill="none" stroke="#ff000088" strokeWidth="0.5" />

        {/* Pupil */}
        <circle cx={cx + pupilPos.x} cy={cy + pupilPos.y}
          r={pupilR} fill="#000000" />

        {/* Pupil core glow */}
        <circle className="core-dot"
          cx={cx + pupilPos.x} cy={cy + pupilPos.y}
          r={pupilR * 0.4} fill="#ff0000" />

        {/* Pupil highlight */}
        <circle cx={cx + pupilPos.x - pupilR * 0.3} cy={cy + pupilPos.y - pupilR * 0.3}
          r={pupilR * 0.2} fill="#ff440066" />
      </g>

      {/* Eye outline */}
      <path d={eyePath} fill="none" stroke="#ff0000" strokeWidth="0.8" />

      {/* Eyelid blink */}
      {isBlinking && (
        <path d={topLidPath} fill="#020000" stroke="#ff0000" strokeWidth="0.8" />
      )}

      {/* Eye corner dots */}
      <circle cx={cx - eyeW} cy={cy} r="1.5" fill="#ff0000" opacity="0.8" />
      <circle cx={cx + eyeW} cy={cy} r="1.5" fill="#ff0000" opacity="0.8" />

      {/* Optional text */}
      {showText && (
        <>
          <text x={cx} y={s - 4} textAnchor="middle"
            fill="#ff0000" fontSize={s * 0.14} fontFamily="Courier New"
            letterSpacing="3">
            GOD'S EYE
          </text>
          <text x={cx} y={s + 6} textAnchor="middle"
            fill="#440000" fontSize={s * 0.08} fontFamily="Courier New"
            letterSpacing="2">
            OMNIVISION
          </text>
        </>
      )}
    </svg>
  );
}
