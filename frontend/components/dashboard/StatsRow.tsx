"use client";

import { DEMO_STATS } from "@/lib/demo-data";

const stats = [
  {
    label: "Total Processed",
    value: `$${DEMO_STATS.totalPaymentsProcessed.toLocaleString()}`,
    change: "+12.5%",
    positive: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2V18M6 6L10 2L14 6" stroke="#00B894" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    sparkline: [30, 45, 35, 55, 50, 70, 65, 80, 75, 90, 85, 95],
  },
  {
    label: "Active Projects",
    value: DEMO_STATS.activeProjects.toString(),
    change: "+1 this month",
    positive: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="3" stroke="#6C5CE7" strokeWidth="1.5" />
        <path d="M7 10H13M10 7V13" stroke="#6C5CE7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    sparkline: [1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3],
  },
  {
    label: "Contributors",
    value: DEMO_STATS.totalContributors.toString(),
    change: "+2 new",
    positive: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="7" cy="7" r="3" stroke="#00B894" strokeWidth="1.5" />
        <circle cx="13" cy="7" r="3" stroke="#00B894" strokeWidth="1.5" />
        <path d="M2 16C2 13.7909 3.79086 12 6 12H8C10.2091 12 12 13.7909 12 16" stroke="#00B894" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    sparkline: [4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8],
  },
  {
    label: "AI Invoices",
    value: DEMO_STATS.aiInvoicesGenerated.toString(),
    change: "+3 this week",
    positive: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 4H12L16 8V16C16 16.5523 15.5523 17 15 17H5C4.44772 17 4 16.5523 4 16V4Z" stroke="#6C5CE7" strokeWidth="1.5" />
        <path d="M8 11H12M8 14H10" stroke="#6C5CE7" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    sparkline: [2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15],
  },
];

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="opacity-40">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StatsRow() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-[rgba(255,255,255,0.1)] transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.04)] flex items-center justify-center">
              {stat.icon}
            </div>
            <MiniSparkline
              data={stat.sparkline}
              color={i % 2 === 0 ? "#00B894" : "#6C5CE7"}
            />
          </div>

          <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[rgba(255,255,255,0.45)]">{stat.label}</p>
            <span className="text-[10px] text-[#00B894] font-medium">{stat.change}</span>
          </div>

          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(0,184,148,0.02)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
