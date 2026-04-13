"use client";

import { useState, useEffect } from "react";

interface PaymentFlowStep {
  label: string;
  description: string;
}

interface Props {
  steps: PaymentFlowStep[];
  onComplete: () => void;
  totalAmount: number;
  contributorCount: number;
  currency: string;
}

export default function PaymentFlowAnimation({
  steps,
  onComplete,
  totalAmount,
  contributorCount,
  currency,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<("pending" | "processing" | "completed")[]>(
    steps.map(() => "pending")
  );

  useEffect(() => {
    if (currentStep >= steps.length) {
      setTimeout(onComplete, 500);
      return;
    }

    // Start processing current step
    setStepStatuses((prev) => {
      const next = [...prev];
      next[currentStep] = "processing";
      return next;
    });

    // Complete after delay
    const timer = setTimeout(() => {
      setStepStatuses((prev) => {
        const next = [...prev];
        next[currentStep] = "completed";
        return next;
      });
      setTimeout(() => setCurrentStep((s) => s + 1), 400);
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentStep, steps.length, onComplete]);

  return (
    <div className="glass-card rounded-2xl p-6 glow-green">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B894] to-[#00B894]/50 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2V18M6 6L10 2L14 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Processing Payment via HSP</h3>
          <p className="text-xs text-[rgba(255,255,255,0.45)]">
            ${totalAmount.toLocaleString()} {currency} to {contributorCount} contributors
          </p>
        </div>
      </div>

      <div className="space-y-0">
        {steps.map((step, i) => {
          const status = stepStatuses[i];
          return (
            <div key={i} className="flex gap-4">
              {/* Status indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                    status === "completed"
                      ? "bg-[#00B894]/20 scale-100"
                      : status === "processing"
                      ? "bg-[#6C5CE7]/20 scale-110"
                      : "bg-[rgba(255,255,255,0.05)] scale-100"
                  }`}
                >
                  {status === "completed" ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="#00B894" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : status === "processing" ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin">
                      <circle cx="7" cy="7" r="5" stroke="#6C5CE7" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[rgba(255,255,255,0.15)]" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-px h-10 transition-colors duration-500 ${
                      status === "completed" ? "bg-[#00B894]/30" : "bg-[rgba(255,255,255,0.06)]"
                    }`}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-8">
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    status === "completed"
                      ? "text-[#00B894]"
                      : status === "processing"
                      ? "text-white"
                      : "text-[rgba(255,255,255,0.3)]"
                  }`}
                >
                  {step.label}
                  {status === "completed" && " ✓"}
                </p>
                <p className="text-xs text-[rgba(255,255,255,0.35)] mt-0.5">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden mt-2">
        <div
          className="h-full bg-gradient-to-r from-[#00B894] to-[#6C5CE7] rounded-full transition-all duration-700"
          style={{ width: `${(stepStatuses.filter((s) => s === "completed").length / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
