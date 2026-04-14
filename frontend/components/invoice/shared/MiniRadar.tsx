"use client";

import type { ImpactScores } from "@/lib/ai";

const AXES: (keyof ImpactScores)[] = [
  "complexity",
  "featureImpact",
  "scopeBreadth",
  "consistency",
  "volume",
];

interface Props {
  scores: ImpactScores;
  color: string;
  size?: number;
}

export default function MiniRadar({ scores, color, size = 40 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;

  const getVertex = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
    const dist = (value / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  // Background pentagon
  const gridPoints = AXES.map((_, i) => getVertex(i, 100));
  const gridPath =
    gridPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") + " Z";

  // Axis lines
  const axisLines = AXES.map((_, i) => getVertex(i, 100));

  // Data polygon
  const dataPoints = AXES.map((axis, i) => getVertex(i, scores[axis]));
  const dataPath =
    dataPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") + " Z";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="flex-shrink-0"
    >
      <path d={gridPath} fill="none" stroke="#252A38" strokeWidth="0.5" />
      {axisLines.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="#252A38"
          strokeWidth="0.5"
        />
      ))}
      <path
        d={dataPath}
        fill={color}
        fillOpacity={0.3}
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  );
}
