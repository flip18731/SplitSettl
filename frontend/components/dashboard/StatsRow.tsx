"use client";

import { DEMO_STATS } from "@/lib/demo-data";
import Card from "@/components/shared/Card";

const stats = [
  {
    label: "Total Processed",
    value: DEMO_STATS.totalPaymentsProcessed,
    prefix: "$",
    accent: "teal" as const,
  },
  {
    label: "Active Projects",
    value: DEMO_STATS.activeProjects,
    prefix: "",
    accent: "teal" as const,
  },
  {
    label: "Contributors",
    value: DEMO_STATS.totalContributors,
    prefix: "",
    accent: "teal" as const,
  },
  {
    label: "AI Invoices",
    value: DEMO_STATS.aiInvoicesGenerated,
    prefix: "",
    accent: "orange" as const,
  },
];

export default function StatsRow() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
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
              {stat.value.toLocaleString()}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
