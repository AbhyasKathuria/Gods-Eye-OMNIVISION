import { useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

// Simplified world continent polygons in [longitude, latitude] degrees
// Detailed world continent and major island polygons in [longitude, latitude] degrees
const CONTINENTS = [
  // North America (detailed)
  [
    [-168, 65], [-150, 70], [-120, 70], [-100, 75], [-80, 75], [-75, 80], [-60, 80], [-55, 60], [-60, 50],
    [-50, 50], [-60, 45], [-75, 40], [-80, 25], [-81, 25], [-80, 30], [-82, 35], [-97, 25], [-97, 18],
    [-83, 9], [-80, 9], [-88, 16], [-100, 20], [-105, 18], [-110, 22], [-110, 30], [-115, 33], [-125, 48],
    [-135, 55], [-150, 58], [-160, 60]
  ],
  // Greenland
  [
    [-73, 78], [-60, 83], [-30, 83], [-10, 80], [-20, 70], [-40, 60], [-50, 60], [-55, 65]
  ],
  // South America (detailed)
  [
    [-80, 12], [-72, 10], [-62, 10], [-50, -5], [-35, -5], [-35, -8], [-40, -22], [-60, -38], 
    [-65, -45], [-70, -55], [-75, -53], [-73, -40], [-71, -30], [-78, -15], [-81, -5], [-80, 5]
  ],
  // Africa (detailed)
  [
    [-17, 32], [-5, 36], [10, 37], [25, 32], [32, 30], [34, 28], [43, 12], [51, 11], [46, -5],
    [39, -20], [32, -30], [28, -34], [18, -34], [12, -22], [11, -5], [14, 5], [9, 5], [4, 10],
    [-15, 15]
  ],
  // Madagascar
  [
    [47, -12], [50, -15], [47, -25], [44, -25], [43, -20], [46, -15]
  ],
  // Eurasia (detailed - including Spain, Scandinavia, Italy, Greece, India, Indochina)
  [
    [-10, 36], [-8, 43], [-1, 43], [5, 50], [5, 60], [10, 60], [10, 65], [15, 65], [20, 70], 
    [25, 71], [30, 70], [40, 75], [60, 76], [80, 76], [100, 77], [120, 77], [140, 77], [160, 76], 
    [170, 70], [180, 68], [175, 64], [160, 55], [140, 50], [142, 40], [130, 35], [126, 22],
    [115, 20], [109, 18], [108, 10], [98, 10], [96, 20], [90, 22], [88, 22], [80, 10], [77, 8],
    [72, 20], [68, 24], [60, 25], [60, 12], [45, 12], [35, 15], [35, 30], [26, 38], [15, 38],
    [20, 42], [15, 45], [12, 40], [5, 43], [2, 38], [-5, 36]
  ],
  // United Kingdom & Ireland
  [
    [-10, 50], [-5, 58], [-2, 58], [2, 51], [-2, 50]
  ],
  // Japan (Honshu/Hokkaido)
  [
    [130, 32], [136, 35], [142, 40], [145, 44], [140, 44], [138, 38]
  ],
  // Italy (distinct boot peninsula shape)
  [
    [12, 46], [13, 42], [18, 40], [15, 38], [12, 40], [9, 44]
  ],
  // Australia (detailed)
  [
    [113, -25], [115, -34], [122, -35], [130, -32], [138, -35], [140, -38], [148, -38], [151, -33],
    [153, -28], [145, -15], [142, -10], [136, -12], [129, -15]
  ],
  // Antarctica
  [[-180, -75], [180, -75], [180, -90], [-180, -90]]
];

const BEACON_DATA = [
  { label: "TARGET", lat: 18.97, lon: 72.82, color: "#ff0000" }, // Mumbai
  { label: "BREACH", lat: 51.5074, lon: -0.1278, color: "#ff4400" }, // London
  { label: "THREAT", lat: 40.7128, lon: -74.006, color: "#ff0000" }, // New York
  { label: "ACTIVE", lat: 35.6762, lon: 139.6503, color: "#ff4400" }, // Tokyo
  { label: "ALERT", lat: -33.8688, lon: 151.2093, color: "#ff5500" }, // Sydney
  { label: "TARGET", lat: -22.9068, lon: -43.1729, color: "#ff0000" }, // Rio de Janeiro
];

// Great circle connections between cities to draw threat trajectories
const CONNECTIONS = [
  [1, 2], // London <-> New York
  [2, 3], // New York <-> Tokyo
  [3, 0], // Tokyo <-> Mumbai
  [0, 4], // Mumbai <-> Sydney
  [1, 5], // London <-> Rio
];

// Helper to check if a point is inside a polygon (ray-casting algorithm)
function pointInPolygon(point, vs) {
  const x = point[0], y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// 3D coordinate rotation helpers
function rotatePoint(pt, angleY, angleX) {
  // Rotate around X axis (pitch/tilt)
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const y1 = pt.y * cosX - pt.z * sinX;
  const z1 = pt.y * sinX + pt.z * cosX;
  
  // Rotate around Y axis (yaw/spin)
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const x2 = pt.x * cosY - z1 * sinY;
  const z2 = pt.x * sinY + z1 * cosY;
  
  return { x: x2, y: y1, z: z2 };
}

// Spherical Linear Interpolation (Slerp) to build great circle arcs
function slerpArc(p1, p2, radius, segments = 20) {
  const arcPoints = [];
  const x1 = p1.x / radius, y1 = p1.y / radius, z1 = p1.z / radius;
  const x2 = p2.x / radius, y2 = p2.y / radius, z2 = p2.z / radius;
  
  const dot = x1 * x2 + y1 * y2 + z1 * z2;
  const omega = Math.acos(Math.max(-1, Math.min(1, dot)));
  
  if (omega < 0.05) return [p1, p2];
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const s1 = Math.sin((1 - t) * omega) / Math.sin(omega);
    const s2 = Math.sin(t * omega) / Math.sin(omega);
    
    arcPoints.push({
      x: (s1 * x1 + s2 * x2) * radius,
      y: (s1 * y1 + s2 * y2) * radius,
      z: (s1 * z1 + s2 * z2) * radius
    });
  }
  return arcPoints;
}

export default function Globe3D() {
  const { colors } = useContext(ThemeContext);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 340;
    let height = 340;
    const radius = 105;
    const cx = width / 2;
    const cy = height / 2;

    const isRed = colors.accent === "#ff0000" || colors.accent === "red";
    const primaryColor = isRed ? "#ff0000" : "#00ff41";
    const dimAccent = isRed ? "#0b0000" : "#000b00";
    const outlineColor = isRed ? "#440000" : "#003300";
    const labelColor = isRed ? "#ff4400" : "#00ff41";
    const coordColor = isRed ? "#661111" : "#116611";

    const dotStyle = isRed ? "#ff0000" : "#00ff41";
    const backDotStyle = isRed ? "rgba(255, 0, 0, 0.08)" : "rgba(0, 255, 65, 0.08)";
    const arcStyle = isRed ? "rgba(255, 34, 0, 0.7)" : "rgba(0, 255, 65, 0.7)";
    const backArcStyle = isRed ? "rgba(255, 68, 0, 0.08)" : "rgba(0, 255, 65, 0.08)";
    
    const ringColor1 = isRed ? "255, 0, 0" : "0, 255, 65";
    const ringColor2 = isRed ? "255, 68, 0" : "0, 255, 65";
    
    const radarColor = isRed ? "255, 0, 0" : "0, 255, 65";
    const crosshairColor = isRed ? "rgba(255, 0, 0, 0.15)" : "rgba(0, 255, 65, 0.15)";
    const boxColor = isRed ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 255, 65, 0.5)";

    // Generate static land dots
    const landPoints = [];
    // lat from -90 to 90 degrees, lon from -180 to 180 degrees
    for (let lat = -80; lat <= 80; lat += 3.2) {
      const latRad = (lat * Math.PI) / 180;
      const cosLat = Math.cos(latRad);
      // Adjust longitude density near the poles
      const stepLon = cosLat > 0.1 ? 3.2 / cosLat : 30;
      
      for (let lon = -180; lon <= 180; lon += stepLon) {
        let isLand = false;
        for (const poly of CONTINENTS) {
          if (pointInPolygon([lon, lat], poly)) {
            isLand = true;
            break;
          }
        }
        
        if (isLand) {
          const lonRad = (lon * Math.PI) / 180;
          landPoints.push({
            x: radius * Math.cos(latRad) * Math.sin(lonRad),
            y: -radius * Math.sin(latRad),
            z: radius * Math.cos(latRad) * Math.cos(lonRad)
          });
        }
      }
    }

    // Convert threat beacons to 3D points
    const beacons = BEACON_DATA.map(b => {
      const latRad = (b.lat * Math.PI) / 180;
      const lonRad = (b.lon * Math.PI) / 180;
      return {
        ...b,
        color: isRed ? b.color : "#00ff41",
        local: {
          x: radius * Math.cos(latRad) * Math.sin(lonRad),
          y: -radius * Math.sin(latRad),
          z: radius * Math.cos(latRad) * Math.cos(lonRad)
        }
      };
    });

    // Generate interpolated connecting arcs
    const arcs = CONNECTIONS.map(([srcIdx, dstIdx]) => {
      const src = beacons[srcIdx].local;
      const dst = beacons[dstIdx].local;
      return slerpArc(src, dst, radius, 18);
    });

    let spinY = 0;
    let tiltX = 0.3; // Tilt coordinates slightly towards user
    let frameId;
    let time = 0;

    const render = () => {
      time++;
      // Spin the globe and add a very slow tilting nod motion
      spinY += 0.005;
      tiltX = 0.28 + 0.08 * Math.sin(time * 0.004);

      // Clear with radial gradient background for tactical radar glow
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);

      // Radial dark background glow
      const glowGrad = ctx.createRadialGradient(cx, cy, radius - 40, cx, cy, radius + 30);
      glowGrad.addColorStop(0, "#000000");
      glowGrad.addColorStop(0.7, dimAccent);
      glowGrad.addColorStop(1, "#000000");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Rotate all points
      const rotPoints = landPoints.map(pt => rotatePoint(pt, spinY, tiltX));
      const rotBeacons = beacons.map(b => ({
        ...b,
        proj: rotatePoint(b.local, spinY, tiltX)
      }));
      const rotArcs = arcs.map(arc => arc.map(pt => rotatePoint(pt, spinY, tiltX)));

      // -------------------------------------------------------------
      // PASS 1: DRAW BACKSIDE HEMISPHERE (z <= 0)
      // -------------------------------------------------------------
      ctx.fillStyle = backDotStyle;
      rotPoints.forEach(pt => {
        if (pt.z <= 0) {
          ctx.beginPath();
          ctx.arc(cx + pt.x, cy + pt.y, 1, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      ctx.strokeStyle = backArcStyle;
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 0.8;
      rotArcs.forEach(arc => {
        ctx.beginPath();
        let first = true;
        arc.forEach(pt => {
          if (pt.z <= 0) {
            if (first) {
              ctx.moveTo(cx + pt.x, cy + pt.y);
              first = false;
            } else {
              ctx.lineTo(cx + pt.x, cy + pt.y);
            }
          }
        });
        ctx.stroke();
      });
      ctx.setLineDash([]); // Reset dash

      // -------------------------------------------------------------
      // PASS 2: DRAW FRONTSIDE HEMISPHERE (z > 0)
      // -------------------------------------------------------------
      
      // Draw grid lines (tactical latitude/longitude lines on front side)
      ctx.strokeStyle = isRed ? "rgba(255, 0, 0, 0.15)" : "rgba(0, 255, 65, 0.15)";
      ctx.lineWidth = 0.6;
      // Latitude bands on front
      [-45, -20, 0, 20, 45].forEach(latDeg => {
        const latRad = (latDeg * Math.PI) / 180;
        const latR = radius * Math.cos(latRad);
        const latY = -radius * Math.sin(latRad);
        
        ctx.beginPath();
        for (let deg = -180; deg <= 180; deg += 10) {
          const lonRad = (deg * Math.PI) / 180;
          const pt = {
            x: latR * Math.sin(lonRad),
            y: latY,
            z: latR * Math.cos(lonRad)
          };
          const rPt = rotatePoint(pt, spinY, tiltX);
          if (rPt.z > 0) {
            ctx.lineTo(cx + rPt.x, cy + rPt.y);
          } else {
            ctx.moveTo(cx + rPt.x, cy + rPt.y);
          }
        }
        ctx.stroke();
      });

      // Front continent dots
      ctx.fillStyle = dotStyle;
      rotPoints.forEach(pt => {
        if (pt.z > 0) {
          ctx.beginPath();
          ctx.arc(cx + pt.x, cy + pt.y, 1.2, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Front connection arcs (threat streams)
      ctx.strokeStyle = arcStyle;
      ctx.lineWidth = 1.0;
      rotArcs.forEach(arc => {
        ctx.beginPath();
        let first = true;
        arc.forEach(pt => {
          if (pt.z > 0) {
            if (first) {
              ctx.moveTo(cx + pt.x, cy + pt.y);
              first = false;
            } else {
              ctx.lineTo(cx + pt.x, cy + pt.y);
            }
          } else {
            first = true; // Break line path for back-face clipping
          }
        });
        ctx.stroke();
      });

      // Front threat beacons
      rotBeacons.forEach(b => {
        if (b.proj.z > 0) {
          const bx = cx + b.proj.x;
          const by = cy + b.proj.y;
          const pulse = (Math.sin(time * 0.07 + b.lat) + 1) / 2; // Unique pulsing offsets

          // Draw pulsing outer rings
          ctx.strokeStyle = `rgba(${ringColor1}, ${0.6 - pulse * 0.5})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(bx, by, 3 + pulse * 14, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.strokeStyle = `rgba(${ringColor2}, ${0.4 - pulse * 0.3})`;
          ctx.beginPath();
          ctx.arc(bx, by, 6 + pulse * 6, 0, 2 * Math.PI);
          ctx.stroke();

          // Beacon center core
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, 2 * Math.PI);
          ctx.fill();

          // Reticle bounding box corners
          ctx.strokeStyle = boxColor;
          ctx.lineWidth = 0.8;
          const boxSize = 8;
          ctx.beginPath();
          // Top-left corner
          ctx.moveTo(bx - boxSize, by - boxSize + 3);
          ctx.lineTo(bx - boxSize, by - boxSize);
          ctx.lineTo(bx - boxSize + 3, by - boxSize);
          // Top-right corner
          ctx.moveTo(bx + boxSize, by - boxSize + 3);
          ctx.lineTo(bx + boxSize, by - boxSize);
          ctx.lineTo(bx + boxSize - 3, by - boxSize);
          // Bottom-left corner
          ctx.moveTo(bx - boxSize, by + boxSize - 3);
          ctx.lineTo(bx - boxSize, by + boxSize);
          ctx.lineTo(bx - boxSize + 3, by + boxSize);
          // Bottom-right corner
          ctx.moveTo(bx + boxSize, by + boxSize - 3);
          ctx.lineTo(bx + boxSize, by + boxSize);
          ctx.lineTo(bx + boxSize - 3, by + boxSize);
          ctx.stroke();

          // HUD text label
          ctx.fillStyle = labelColor;
          ctx.font = "bold 8px 'Courier New', monospace";
          ctx.fillText(b.label, bx + 12, by - 4);

          // Coordinate string
          ctx.fillStyle = coordColor;
          ctx.font = "7px 'Courier New', monospace";
          ctx.fillText(`${b.lat.toFixed(1)}°N, ${b.lon.toFixed(1)}°E`, bx + 12, by + 5);
        }
      });

      // -------------------------------------------------------------
      // PASS 3: DRAW STATIC OVERLAYS (Radar Scope & Sweeps)
      // -------------------------------------------------------------
      
      // Radar sweeps
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((time * 0.015) % (2 * Math.PI));
      const sweepGrad = ctx.createLinearGradient(0, 0, radius, 0);
      sweepGrad.addColorStop(0, `rgba(${radarColor}, 0)`);
      sweepGrad.addColorStop(0.7, `rgba(${radarColor}, 0.05)`);
      sweepGrad.addColorStop(1, `rgba(${radarColor}, 0.2)`);
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Outer glowing compass ring
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 15, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 13, 0, 2 * Math.PI);
      ctx.stroke();

      // Dashed ticks around scope
      ctx.strokeStyle = isRed ? "rgba(255, 0, 0, 0.3)" : "rgba(0, 255, 65, 0.3)";
      ctx.setLineDash([2, 8]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 18, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // HUD crosshairs
      ctx.strokeStyle = crosshairColor;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      // Horizontal crosshair
      ctx.moveTo(cx - radius - 25, cy); ctx.lineTo(cx - radius - 15, cy);
      ctx.moveTo(cx + radius + 15, cy); ctx.lineTo(cx + radius + 25, cy);
      // Vertical crosshair
      ctx.moveTo(cx, cy - radius - 25); ctx.lineTo(cx, cy - radius - 15);
      ctx.moveTo(cx, cy + radius + 15); ctx.lineTo(cx, cy + radius + 25);
      ctx.stroke();

      // Digital status overlays
      ctx.fillStyle = primaryColor;
      ctx.font = "9px 'Courier New', monospace";
      ctx.fillText("SYS: ACTV", cx - radius - 20, cy - radius);
      ctx.fillText("HDG: 345°", cx + radius - 25, cy - radius);
      ctx.fillText("TGT: SCAN", cx - radius - 20, cy + radius + 10);
      ctx.fillText("OMNIVISION", cx + radius - 30, cy + radius + 10);

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [colors]);

  return (
    <div className="flex-1 flex items-center justify-center relative w-full h-full min-h-[350px]">
      <canvas
        ref={canvasRef}
        width={340}
        height={340}
        style={{
          width: "340px",
          height: "340px",
          background: "transparent",
        }}
      />
    </div>
  );
}