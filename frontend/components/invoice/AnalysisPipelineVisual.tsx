"use client";

import { useId } from "react";

/**
 * Decorative pipeline: GitHub → commits → diffs → model → split.
 * Echoes the flowing-line look used elsewhere in the app.
 */
interface Props {
  /** When true, freeze in a “success” state */
  complete?: boolean;
}

const STAGES = [
  { id: "gh", label: "GitHub", short: "API" },
  { id: "git", label: "Commits", short: "log" },
  { id: "diff", label: "Diffs", short: "patch" },
  { id: "ai", label: "Model", short: "LLM" },
  { id: "out", label: "Split", short: "pay" },
];

export default function AnalysisPipelineVisual({ complete = false }: Props) {
  const gradId = useId().replace(/:/g, "");

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border/80 bg-bg-primary/40 px-3 py-4 sm:px-5">
      {/* Background SVG — same language as FlowCanvas */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]"
        viewBox="0 0 640 88"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2DD4A8" stopOpacity="0.15" />
            <stop offset="45%" stopColor="#F59E42" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2DD4A8" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M 0 44 Q 80 12, 160 44 T 320 40 T 480 48 T 640 42"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          opacity="0.5"
        />
        <path
          d="M 0 44 Q 80 12, 160 44 T 320 40 T 480 48 T 640 42"
          fill="none"
          stroke="#2DD4A8"
          strokeWidth="2"
          strokeLinecap="round"
          className={complete ? "opacity-70" : "flow-line opacity-90"}
        />
      </svg>

      {/* Station row */}
      <div className="relative z-[1] flex items-start justify-between gap-0.5 sm:gap-1">
        {STAGES.map((stage, i) => (
          <div
            key={stage.id}
            className="flex flex-1 flex-col items-center gap-1.5 min-w-0"
          >
            <div
              className={`pipeline-node-ring flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-colors duration-500 ${
                complete
                  ? "border-accent-teal/80 bg-accent-teal/15 shadow-[0_0_16px_rgba(45,212,168,0.35)]"
                  : "border-border bg-bg-elevated/90 pipeline-node-breathe"
              }`}
              style={
                complete
                  ? undefined
                  : { animationDelay: `${i * 0.28}s` }
              }
            >
              <span
                className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${
                  complete ? "bg-accent-teal scale-110" : "bg-accent-orange pipeline-dot-core"
                }`}
                style={
                  complete ? undefined : { animationDelay: `${i * 0.28}s` }
                }
              />
            </div>
            <div className="text-center leading-tight">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary truncate max-w-[4.5rem] sm:max-w-none">
                {stage.label}
              </p>
              <p className="text-[8px] font-mono text-text-tertiary opacity-80">
                {stage.short}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Traveling packet on a faux track (mobile-friendly bar) */}
      <div className="relative z-[1] mt-4 h-1 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className={`h-full rounded-full ${
            complete
              ? "w-full bg-gradient-to-r from-accent-orange via-accent-teal to-accent-teal transition-all duration-700 ease-out"
              : "analysis-packet-run w-[28%] bg-gradient-to-r from-transparent via-accent-teal to-accent-orange opacity-90"
          }`}
        />
      </div>

      <p className="relative z-[1] mt-2 text-center text-[10px] text-text-tertiary font-mono tracking-wide">
        {complete
          ? "Pipeline sealed — opening invoice"
          : "Streaming signals along the commit graph…"}
      </p>
    </div>
  );
}
