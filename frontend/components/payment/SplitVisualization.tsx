"use client";

interface SplitData {
  name: string;
  percentage: number;
  amount?: number;
  color: string;
}

const COLORS = ["#00B894", "#6C5CE7", "#74B9FF", "#FDCB6E", "#FD79A8", "#A29BFE", "#55EFC4", "#FF7675"];

export function getColor(index: number): string {
  return COLORS[index % COLORS.length];
}

export default function SplitVisualization({
  splits,
  size = 160,
}: {
  splits: SplitData[];
  size?: number;
}) {
  const total = splits.reduce((s, d) => s + d.percentage, 0);
  let currentAngle = -90;

  const arcs = splits.map((split) => {
    const angle = (split.percentage / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const r = size / 2 - 10;
    const cx = size / 2;
    const cy = size / 2;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { path, color: split.color };
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {arcs.map((arc, i) => (
            <path
              key={i}
              d={arc.path}
              fill={arc.color}
              opacity={0.8}
              stroke="#0A0A0F"
              strokeWidth="2"
            />
          ))}
          {/* Center hole for donut effect */}
          <circle cx={size / 2} cy={size / 2} r={size / 4} fill="#0A0A0F" />
        </svg>
      </div>

      <div className="space-y-2">
        {splits.map((split, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ background: split.color }}
            />
            <span className="text-xs text-[rgba(255,255,255,0.6)] min-w-[80px]">{split.name}</span>
            <span className="text-xs font-semibold text-white">{split.percentage}%</span>
            {split.amount !== undefined && (
              <span className="text-xs text-[rgba(255,255,255,0.35)]">
                (${split.amount.toLocaleString()})
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
