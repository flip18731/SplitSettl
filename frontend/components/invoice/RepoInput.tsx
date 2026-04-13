"use client";

import { useState } from "react";

interface RepoInputProps {
  onSubmit: (repoUrl: string, budget: number, branch: string) => void;
  disabled?: boolean;
}

export default function RepoInput({ onSubmit, disabled }: RepoInputProps) {
  const [repoUrl, setRepoUrl] = useState("https://github.com/anthropics/anthropic-sdk-python");
  const [budget, setBudget] = useState(1200);
  const [branch, setBranch] = useState("main");

  const isValid = /github\.com\/[^/]+\/[^/\s?#]+/.test(repoUrl) && budget > 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Repository URL */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary mb-2">
          GitHub Repository
        </label>
        <input
          type="url"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-md bg-bg-surface border border-border text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-teal transition-colors font-mono"
          placeholder="https://github.com/owner/repo"
          disabled={disabled}
        />
      </div>

      {/* Budget + Branch row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary mb-2">
            Sprint Budget
          </label>
          <div className="relative">
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-4 py-3 pr-16 rounded-md bg-bg-surface border border-border text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-teal transition-colors font-sans"
              placeholder="1200"
              min={1}
              disabled={disabled}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-text-tertiary">
              USDT
            </span>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary mb-2">
            Branch
          </label>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-bg-surface border border-border text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-teal transition-colors font-mono"
            placeholder="main"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Analyze button */}
      <button
        onClick={() => onSubmit(repoUrl, budget, branch)}
        disabled={!isValid || disabled}
        className="w-full py-4 rounded-md bg-gradient-to-br from-accent-teal to-[#22B896] text-bg-primary text-[15px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2.5"
      >
        <span className="w-2 h-2 rounded-full bg-accent-orange" />
        Analyze Repository
      </button>
    </div>
  );
}
