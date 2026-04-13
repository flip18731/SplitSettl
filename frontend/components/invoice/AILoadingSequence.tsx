"use client";

import { useState, useEffect } from "react";

const steps = [
  "AI is analyzing contributions...",
  "Identifying 3 contributors...",
  "Calculating fair splits...",
  "Generating invoice...",
];

export default function AILoadingSequence() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= steps.length) return prev;
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-8 space-y-4">
      {steps.map((step, i) => (
        <div
          key={i}
          className="flex items-center gap-3 transition-all duration-300"
          style={{
            opacity: i < visibleCount ? 1 : 0,
            transform: i < visibleCount ? "translateY(0)" : "translateY(8px)",
            transitionDelay: `${i * 100}ms`,
          }}
        >
          {i < visibleCount - 1 ? (
            <div className="w-5 h-5 rounded-full bg-accent-teal-bg flex items-center justify-center flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2.5 5L4.5 7L7.5 3" stroke="#2DD4A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : i === visibleCount - 1 ? (
            <div className="w-5 h-5 rounded-full border-2 border-accent-orange border-t-transparent animate-spinner flex-shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-bg-elevated flex-shrink-0" />
          )}
          <span
            className={`text-[14px] ${
              i < visibleCount - 1
                ? "text-text-tertiary"
                : i === visibleCount - 1
                ? "text-accent-orange font-medium"
                : "text-text-tertiary"
            }`}
          >
            {step}
          </span>
        </div>
      ))}

      {/* Scan-line / progress effect */}
      <div className="mt-6 h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${(visibleCount / steps.length) * 100}%`,
            background: "linear-gradient(90deg, #F59E42, #2DD4A8)",
          }}
        />
      </div>
    </div>
  );
}
