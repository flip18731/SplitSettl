"use client";

import Card from "@/components/shared/Card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatNumberEnUS } from "@/lib/format";

export default function StatsRow() {
  const { stats, source } = useDashboardStats();

  const rows = [
    {
      label: "Total Processed",
      value: stats.totalPaymentsProcessed,
      prefix: "$",
      accent: "teal" as const,
    },
    {
      label: "Active Projects",
      value: stats.activeProjects,
      prefix: "",
      accent: "teal" as const,
    },
    {
      label: "Contributors",
      value: stats.totalContributors,
      prefix: "",
      accent: "teal" as const,
    },
    {
      label: "AI Invoices (est.)",
      value: stats.aiInvoicesGenerated,
      prefix: "",
      accent: "orange" as const,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {rows.map((stat) => (
        <Card key={stat.label} accent={stat.accent}>
          <div className="px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary mb-2">
              {stat.label}
            </p>
            <p className="text-[30px] font-light text-text-primary leading-none">
              {stat.prefix && (
                <span className={stat.accent === "teal" ? "text-accent-teal" : "text-accent-orange"}>
                  {stat.prefix}
                </span>
              )}
              {formatNumberEnUS(stat.value)}
            </p>
            {stat.label === "Total Processed" && source === "chain" && (
              <p className="text-[9px] text-accent-teal mt-1 font-mono">on-chain</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
