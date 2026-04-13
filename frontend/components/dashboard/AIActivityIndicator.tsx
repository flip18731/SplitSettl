"use client";

import { useState, useEffect } from "react";

const activities = [
  "Analyzed 3 GitHub commits for HashKey DeFi SDK",
  "Generated invoice INV-2024-012 for Smart Contract Audit Tool",
  "Split $900 USDT across 4 contributors",
  "HSP Receipt generated for payment HSP-REQ-012",
  "Monitoring contributor activity for NFT Marketplace Frontend",
  "Verified payment splits for invoice INV-2024-010",
];

export default function AIActivityIndicator() {
  const [currentActivity, setCurrentActivity] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-card rounded-2xl p-5 glow-purple">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C5CE7]/20 to-[#6C5CE7]/5 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z" stroke="#6C5CE7" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">AI Agent</h3>
            <span className="px-2 py-0.5 rounded-full bg-[rgba(108,92,231,0.15)] text-[#6C5CE7] text-[10px] font-semibold">
              Active
            </span>
          </div>
          <p className="text-xs text-[rgba(255,255,255,0.35)]">Powered by Claude</p>
        </div>
      </div>

      <div className="bg-[rgba(0,0,0,0.3)] rounded-xl p-3 font-mono">
        <div className="flex items-start gap-2">
          <span className="text-[#6C5CE7] text-xs mt-0.5">&gt;</span>
          <p
            key={currentActivity}
            className="text-xs text-[rgba(255,255,255,0.6)] animate-fade-in leading-relaxed"
          >
            {activities[currentActivity]}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-[rgba(255,255,255,0.25)]">
          Last action: 2m ago
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-[#6C5CE7]"
              style={{
                animation: `pulse-dot 1.5s infinite ${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
