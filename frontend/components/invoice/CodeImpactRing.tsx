"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { VisualizationData } from "@/lib/ai";
import { displayFirstName, formatNumberEnUS } from "@/lib/format";

const COLORS = ["#2DD4A8", "#F59E42", "#8B93A8", "rgba(45,212,168,0.5)"];

interface Props {
  data: VisualizationData;
}

export default function CodeImpactRing({ data }: Props) {
  const totalLines = data.contributors.reduce(
    (s, c) => s + c.additions + c.deletions,
    0
  );

  const pieData = data.contributors.map((c) => ({
    name: displayFirstName(c.name),
    value: c.additions + c.deletions,
  }));

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-tertiary mb-4">
        Code Impact
      </p>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ payload }) => {
                if (!payload || payload.length === 0) return null;
                const d = payload[0];
                const pct = totalLines > 0 ? ((Number(d.value) / totalLines) * 100).toFixed(1) : "0";
                return (
                  <div className="bg-bg-surface border border-border rounded-lg px-3 py-2">
                    <p className="text-[12px] font-semibold text-text-primary">{d.name}</p>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      {formatNumberEnUS(Number(d.value))} lines ({pct}%)
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-[22px] font-light text-text-primary leading-none">
              {formatNumberEnUS(totalLines)}
            </p>
            <p className="text-[10px] text-text-tertiary mt-1">total lines</p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-1">
        {pieData.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-[11px] text-text-secondary">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
