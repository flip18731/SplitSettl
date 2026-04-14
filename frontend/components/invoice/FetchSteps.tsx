"use client";

import { useState, useEffect } from "react";

interface Props {
  repoSlug: string;
  branch: string;
}

export default function FetchSteps({ repoSlug, branch }: Props) {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Visible, setStep2Visible] = useState(false);
  const [step2Done, setStep2Done] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStep1Done(true);
      setStep2Visible(true);
    }, 800);

    const t2 = setTimeout(() => {
      setStep2Done(true);
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-6">
      <div className="space-y-4">
        {/* Step 1: Connecting */}
        <div className="flex items-center gap-3 animate-fade-slide-in">
          {step1Done ? (
            <div className="w-5 h-5 rounded-full bg-accent-teal-bg flex items-center justify-center flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2.5 5L4.5 7L7.5 3"
                  stroke="#2DD4A8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-orange pulse-glow-orange" />
            </div>
          )}
          <span
            className={`text-[13px] font-medium transition-colors duration-300 ${
              step1Done ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            {step1Done
              ? `Connected to ${repoSlug}`
              : "Connecting to GitHub..."}
          </span>
        </div>

        {/* Step 2: Fetching */}
        <div
          className="flex items-center gap-3 transition-all duration-300"
          style={{
            opacity: step2Visible ? 1 : 0,
            transform: step2Visible ? "translateY(0)" : "translateY(6px)",
          }}
        >
          {step2Done ? (
            <div className="w-5 h-5 rounded-full bg-accent-teal-bg flex items-center justify-center flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2.5 5L4.5 7L7.5 3"
                  stroke="#2DD4A8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : step2Visible ? (
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-accent-orange pulse-glow-orange" />
            </div>
          ) : (
            <div className="w-5 h-5 flex-shrink-0" />
          )}
          <span
            className={`text-[13px] font-medium transition-colors duration-300 ${
              step2Done ? "text-text-primary" : "text-text-secondary"
            }`}
          >
            {step2Done
              ? `Fetching commits from ${branch}...`
              : `Fetching commits from ${branch}...`}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: step2Done ? "100%" : step1Done ? "50%" : "15%",
            background: "linear-gradient(90deg, #F59E42, #2DD4A8)",
          }}
        />
      </div>
    </div>
  );
}
