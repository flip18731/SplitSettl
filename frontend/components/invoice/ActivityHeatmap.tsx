"use client";

import { useMemo } from "react";
import type { VisualizationData } from "@/lib/ai";
import { displayFirstName } from "@/lib/format";

interface Props {
  data: VisualizationData;
}

function getIntensity(count: number): string {
  if (count === 0) return "#252A38";
  if (count === 1) return "rgba(45,212,168,0.3)";
  if (count === 2) return "rgba(45,212,168,0.6)";
  return "#2DD4A8";
}

export default function ActivityHeatmap({ data }: Props) {
  const { days, contributors } = useMemo(() => {
    // Last 30 days
    const dayList: string[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayList.push(d.toISOString().substring(0, 10));
    }

    return {
      days: dayList,
      contributors: data.contributors.map((c) => ({
        name: c.name,
        activity: c.dailyActivity,
      })),
    };
  }, [data]);

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-tertiary mb-4">
        Activity (last 30 days)
      </p>
      <div className="space-y-2">
        {contributors.map((contributor) => (
          <div key={contributor.name} className="flex items-center gap-3">
            <span className="text-[11px] text-text-secondary w-20 text-right truncate flex-shrink-0">
              {displayFirstName(contributor.name)}
            </span>
            <div className="flex gap-[2px] flex-1">
              {days.map((day) => {
                const count = contributor.activity[day] || 0;
                return (
                  <div key={day} className="relative group">
                    <div
                      className="w-[10px] h-[10px] rounded-[2px]"
                      style={{ background: getIntensity(count) }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                      <div className="bg-bg-surface border border-border rounded-lg px-2 py-1 whitespace-nowrap">
                        <span className="text-[10px] text-text-primary">{day}</span>
                        <span className="text-[10px] text-text-tertiary ml-1">
                          {count} commit{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 ml-[92px]">
        <span className="text-[10px] text-text-tertiary">Less</span>
        {[0, 1, 2, 3].map((n) => (
          <div
            key={n}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ background: getIntensity(n) }}
          />
        ))}
        <span className="text-[10px] text-text-tertiary">More</span>
      </div>
    </div>
  );
}
