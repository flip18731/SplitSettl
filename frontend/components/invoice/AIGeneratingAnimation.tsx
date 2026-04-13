"use client";

import { useState, useEffect } from "react";

const analysisLines = [
  "Connecting to AI analysis engine...",
  "Parsing contribution data...",
  "Analyzing commit frequency and complexity...",
  "Evaluating task completion rates...",
  "Calculating contribution weights...",
  "Computing fair split percentages...",
  "Generating invoice line items...",
  "Applying HSP payment request format...",
  "Finalizing invoice structure...",
];

export default function AIGeneratingAnimation() {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= analysisLines.length) return prev;
        return prev + 1;
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-card rounded-2xl p-6 glow-purple">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C5CE7] to-[#6C5CE7]/50 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="animate-spin" style={{ animationDuration: "3s" }}>
            <path d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">AI is analyzing contributions...</h3>
          <p className="text-xs text-[rgba(255,255,255,0.45)]">Powered by Claude | This usually takes a few seconds</p>
        </div>
      </div>

      <div className="bg-[rgba(0,0,0,0.4)] rounded-xl p-4 font-mono text-xs space-y-1.5 max-h-[240px] overflow-hidden">
        {analysisLines.map((line, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 transition-all duration-300 ${
              i < visibleLines ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            <span className={i < visibleLines - 1 ? "text-[#00B894]" : "text-[#6C5CE7]"}>
              {i < visibleLines - 1 ? "✓" : "›"}
            </span>
            <span className={i < visibleLines - 1 ? "text-[rgba(255,255,255,0.4)]" : "text-[rgba(255,255,255,0.7)]"}>
              {line}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#00B894] rounded-full transition-all duration-500"
          style={{ width: `${(visibleLines / analysisLines.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
