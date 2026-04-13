"use client";

import WalletConnect from "./WalletConnect";

export default function Header() {
  return (
    <header className="h-16 border-b border-[rgba(255,255,255,0.06)] bg-[#0A0A0F]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00B894]" style={{ animation: "pulse-dot 2s infinite" }} />
          <span className="text-xs text-[rgba(255,255,255,0.5)] font-medium">AI Agent Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#00B894" strokeWidth="1.5" />
            <path d="M7 4V7L9 9" stroke="#00B894" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-xs text-[rgba(255,255,255,0.6)]">
            Last sync: just now
          </span>
        </div>
        <WalletConnect />
      </div>
    </header>
  );
}
