"use client";

import type { VisualizationData } from "@/lib/ai";
import { displayFirstName } from "@/lib/format";

const EXT_COLORS: Record<string, string> = {
  sol: "#2DD4A8",
  ts: "#F59E42",
  tsx: "#F59E42",
  js: "#B87420",
  jsx: "#B87420",
  py: "#2DD4A8",
  rs: "#8B93A8",
  go: "#8B93A8",
  md: "#5A6275",
  css: "#F59E42",
  html: "#B87420",
  json: "#5A6275",
  yml: "#5A6275",
  yaml: "#5A6275",
  toml: "#5A6275",
};

function getExtColor(ext: string): string {
  return EXT_COLORS[ext] || "#252A38";
}

interface Props {
  data: VisualizationData;
}

export default function FileTypeBreakdown({ data }: Props) {
  return (
    <div className="bg-bg-surface border border-border rounded-lg p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-tertiary mb-4">
        File Types
      </p>
      <div className="space-y-4">
        {data.contributors.map((contributor) => {
          const entries = Object.entries(contributor.fileTypeBreakdown);
          const total = entries.reduce((s, [, v]) => s + v, 0);
          if (total === 0) return null;

          return (
            <div key={contributor.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-medium text-text-primary">
                  {displayFirstName(contributor.name)}
                </span>
                <span className="text-[10px] text-text-tertiary">
                  {contributor.filesChanged} files
                </span>
              </div>
              <div className="flex h-5 rounded overflow-hidden gap-px">
                {entries
                  .sort((a, b) => b[1] - a[1])
                  .map(([ext, count]) => (
                    <div
                      key={ext}
                      className="relative group"
                      style={{
                        width: `${(count / total) * 100}%`,
                        background: getExtColor(ext),
                        minWidth: "4px",
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                        <div className="bg-bg-surface border border-border rounded-lg px-2 py-1 whitespace-nowrap">
                          <span className="text-[10px] font-mono text-text-primary">
                            .{ext}
                          </span>
                          <span className="text-[10px] text-text-tertiary ml-1">
                            {count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        {Object.entries(EXT_COLORS)
          .filter(([ext]) => {
            return data.contributors.some((c) => c.fileTypeBreakdown[ext]);
          })
          .slice(0, 6)
          .map(([ext, color]) => (
            <div key={ext} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
              <span className="text-[10px] font-mono text-text-secondary">.{ext}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
