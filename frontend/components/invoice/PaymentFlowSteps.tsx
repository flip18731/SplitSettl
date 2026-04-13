"use client";

import { useState, useEffect } from "react";

interface Step {
  label: string;
  description: string;
}

interface Props {
  steps: Step[];
  onComplete: () => void;
}

export default function PaymentFlowSteps({ steps, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [statuses, setStatuses] = useState<("pending" | "processing" | "done")[]>(
    steps.map(() => "pending")
  );

  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(onComplete, 600);
      return;
    }

    // Start processing
    setStatuses((prev) => {
      const next = [...prev];
      next[currentStep] = "processing";
      return next;
    });

    const timer = setTimeout(() => {
      // Mark done
      setStatuses((prev) => {
        const next = [...prev];
        next[currentStep] = "done";
        return next;
      });
      setTimeout(() => setCurrentStep((s) => s + 1), 300);
    }, 800);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length, onComplete]);

  return (
    <div className="py-4 space-y-0">
      {steps.map((step, i) => {
        const status = statuses[i];
        return (
          <div
            key={i}
            className="flex gap-3"
            style={{
              opacity: status === "pending" && i > currentStep ? 0 : 1,
              transform: status === "pending" && i > currentStep ? "translateY(8px)" : "translateY(0)",
              transition: "all 300ms ease-out",
            }}
          >
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  status === "done"
                    ? "bg-accent-teal-bg"
                    : status === "processing"
                    ? ""
                    : "bg-bg-elevated"
                }`}
              >
                {status === "done" ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2.5 5L4.5 7L7.5 3" stroke="#2DD4A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : status === "processing" ? (
                  <div className="w-6 h-6 rounded-full border-2 border-accent-orange border-t-transparent animate-spinner" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-px h-8 transition-colors duration-300 ${
                    status === "done" ? "bg-accent-teal" : "bg-border"
                  }`}
                  style={{ opacity: status === "done" ? 0.3 : 1 }}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-6 pt-0.5">
              <p
                className={`text-[13px] font-medium transition-colors duration-300 ${
                  status === "done"
                    ? "text-accent-teal"
                    : status === "processing"
                    ? "text-text-primary"
                    : "text-text-tertiary"
                }`}
              >
                {step.label}
                {status === "done" && (
                  <span className="text-accent-teal ml-1">&#10003;</span>
                )}
              </p>
              <p className="text-[11px] text-text-tertiary mt-0.5">{step.description}</p>
            </div>
          </div>
        );
      })}

      {/* Progress bar */}
      <div className="h-1 bg-border rounded-full overflow-hidden mt-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(statuses.filter((s) => s === "done").length / steps.length) * 100}%`,
            background: "linear-gradient(90deg, #2DD4A8, #F59E42)",
          }}
        />
      </div>
    </div>
  );
}
