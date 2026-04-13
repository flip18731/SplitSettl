"use client";

interface SplitBarProps {
  /** Array of percentages that sum to 100 */
  splits: number[];
}

const COLORS = ["#2DD4A8", "#F59E42", "rgba(45,212,168,0.5)", "#5A6275", "#8B93A8"];

export default function SplitBar({ splits }: SplitBarProps) {
  return (
    <div className="flex h-1 rounded-[2px] overflow-hidden gap-px">
      {splits.map((pct, i) => (
        <div
          key={i}
          style={{
            width: `${pct}%`,
            background: COLORS[i % COLORS.length],
          }}
        />
      ))}
    </div>
  );
}
