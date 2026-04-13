"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { VisualizationData } from "@/lib/ai";

const AUTHOR_COLORS = ["#2DD4A8", "#F59E42", "#8B93A8", "rgba(45,212,168,0.5)"];

function getAuthorColor(authorIndex: number) {
  return AUTHOR_COLORS[authorIndex % AUTHOR_COLORS.length];
}

interface Props {
  data: VisualizationData;
}

export default function CommitTimeline({ data }: Props) {
  const authorNames = data.contributors.map((c) => c.name);

  // Flatten all commits with numeric time + impact
  const scatterData = data.allCommits.map((c) => ({
    time: new Date(c.date).getTime(),
    impact: c.additions + c.deletions,
    size: Math.max(4, Math.min(16, Math.sqrt(c.additions + c.deletions) * 1.5)),
    author: c.author,
    sha: c.sha,
    message: c.message,
    additions: c.additions,
    deletions: c.deletions,
    authorIndex: authorNames.indexOf(c.author),
  }));

  // Group by author for separate colored scatters
  const byAuthor = authorNames.map((name, idx) => ({
    name,
    color: getAuthorColor(idx),
    points: scatterData.filter((d) => d.author === name),
  }));

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-tertiary mb-4">
        Commit Timeline
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <CartesianGrid stroke="#252A38" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            type="number"
            domain={["dataMin", "dataMax"]}
            tick={{ fill: "#5A6275", fontSize: 11 }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            stroke="#252A38"
          />
          <YAxis
            dataKey="impact"
            tick={{ fill: "#5A6275", fontSize: 11 }}
            stroke="#252A38"
            label={{
              value: "Lines changed",
              angle: -90,
              position: "insideLeft",
              fill: "#5A6275",
              fontSize: 10,
              dx: -5,
            }}
          />
          <Tooltip
            content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-bg-surface border border-border rounded-lg px-3 py-2">
                  <p className="text-[12px] font-mono text-text-primary">{d.sha}</p>
                  <p className="text-[11px] text-text-secondary mt-0.5 max-w-[220px] truncate">
                    {d.message}
                  </p>
                  <p className="text-[11px] text-accent-teal mt-1">
                    +{d.additions} / -{d.deletions}
                  </p>
                </div>
              );
            }}
          />
          {byAuthor.map((group) => (
            <Scatter
              key={group.name}
              name={group.name}
              data={group.points}
              fill={group.color}
              opacity={0.8}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        {byAuthor.map((g) => (
          <div key={g.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
            <span className="text-[11px] text-text-secondary">{g.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
