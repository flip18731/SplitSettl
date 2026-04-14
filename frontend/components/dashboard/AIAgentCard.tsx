"use client";

import { useState, useEffect } from "react";
import Card, { CardHeader, CardBody } from "@/components/shared/Card";
import HSPProgressBar from "@/components/shared/HSPProgressBar";

const logEntries = [
  "Open the Invoice page and run Analyze Repository on your GitHub repo.",
  "Splits and wallet hints come from your repo, commits, and optional .splitsettle.json.",
  "On-chain settlement uses your connected wallet on HashKey Chain.",
];

export default function AIAgentCard() {
  const [visibleEntries, setVisibleEntries] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleEntries((prev) => {
        if (prev >= logEntries.length) return 3;
        return prev + 1;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card accent="orange">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-accent-orange pulse-glow-orange" />
          <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-accent-orange">
            AI Agent active
          </span>
        </div>
      </CardHeader>

      <CardBody className="space-y-3">
        {logEntries.slice(0, visibleEntries).map((entry, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 ${
              i === visibleEntries - 1 ? "animate-slide-in-up" : ""
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-accent-teal-bg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M2 4L3.5 5.5L6 2.5" stroke="#2DD4A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[12px] text-text-secondary leading-relaxed">{entry}</span>
          </div>
        ))}

        <div className="pt-2">
          <HSPProgressBar completedSteps={3} showLabels={true} />
        </div>
      </CardBody>
    </Card>
  );
}
