"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { VisualizationData } from "@/lib/ai";
import { formatNumberEnUS } from "@/lib/format";

interface Props {
  data: VisualizationData;
}

export default function ContributorComparison({ data }: Props) {
  const chartData = data.contributors.map((c) => ({
    name: c.name.split(" ")[0], // First name for labels
    fullName: c.name,
    commits: c.commits,
    additions: c.additions,
    deletions: c.deletions,
  }));

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-tertiary mb-4">
        Contributor Comparison
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
          <CartesianGrid stroke="#252A38" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#5A6275", fontSize: 11 }} stroke="#252A38" />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: "#8B93A8", fontSize: 12, fontWeight: 500 }}
            stroke="transparent"
            width={70}
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const d = payload[0]?.payload;
              return (
                <div className="bg-bg-surface border border-border rounded-lg px-3 py-2">
                  <p className="text-[12px] font-semibold text-text-primary">{d.fullName}</p>
                  <p className="text-[11px] text-text-secondary mt-1">
                    {d.commits} commits · +{formatNumberEnUS(d.additions)} / -{formatNumberEnUS(d.deletions)}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="commits" fill="#5A6275" barSize={8} radius={[0, 4, 4, 0]} name="Commits" />
          <Bar dataKey="additions" fill="#2DD4A8" barSize={8} radius={[0, 4, 4, 0]} name="Additions" />
          <Bar dataKey="deletions" fill="#F59E42" barSize={8} radius={[0, 4, 4, 0]} name="Deletions" />
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#5A6275]" />
          <span className="text-[11px] text-text-secondary">Commits</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-accent-teal" />
          <span className="text-[11px] text-text-secondary">Additions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-accent-orange" />
          <span className="text-[11px] text-text-secondary">Deletions</span>
        </div>
      </div>
    </div>
  );
}
