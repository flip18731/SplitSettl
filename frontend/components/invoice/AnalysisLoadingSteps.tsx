"use client";

import { useState, useEffect } from "react";

interface LoadingStep {
  pending: string;
  done: string;
}

interface AnalysisLoadingStepsProps {
  repoSlug: string;
  branch: string;
  /** Called when fetch phase is done; provides steps to fill in results */
  fetchResult: {
    commitsFound?: number;
    contributorsFound?: number;
    totalLines?: number;
    totalFiles?: number;
    splitSummary?: string;
    invoiceId?: string;
  } | null;
}

export default function AnalysisLoadingSteps({
  repoSlug,
  branch,
  fetchResult,
}: AnalysisLoadingStepsProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps: LoadingStep[] = [
    {
      pending: "Connecting to GitHub...",
      done: `Connected to ${repoSlug}`,
    },
    {
      pending: `Fetching commits from ${branch}...`,
      done: fetchResult
        ? `Found ${fetchResult.commitsFound ?? "?"} commits from ${fetchResult.contributorsFound ?? "?"} contributors`
        : "Fetching...",
    },
    {
      pending: "Analyzing code diffs and complexity...",
      done: fetchResult
        ? `Analyzed ${(fetchResult.totalLines ?? 0).toLocaleString()} lines across ${fetchResult.totalFiles ?? "?"} files`
        : "Analyzing...",
    },
    {
      pending: "AI is evaluating contribution impact...",
      done: fetchResult?.splitSummary
        ? `Split: ${fetchResult.splitSummary}`
        : "Evaluating...",
    },
    {
      pending: "Generating invoice...",
      done: fetchResult?.invoiceId
        ? `Invoice ${fetchResult.invoiceId} ready`
        : "Generating...",
    },
  ];

  useEffect(() => {
    // Steps 0-1 animate as "connecting"
    if (activeStep === 0 && !completedSteps.includes(0)) {
      const t = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, 0]);
        setActiveStep(1);
      }, 600);
      return () => clearTimeout(t);
    }

    // Step 1 waits for fetchResult to have commitsFound
    if (activeStep === 1 && fetchResult?.commitsFound && !completedSteps.includes(1)) {
      setCompletedSteps((prev) => [...prev, 1]);
      setActiveStep(2);
      return;
    }

    // Steps 2+ resolve rapidly once we have full result
    if (activeStep >= 2 && fetchResult?.invoiceId && !completedSteps.includes(activeStep)) {
      const t = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, activeStep]);
        if (activeStep < steps.length - 1) {
          setActiveStep((s) => s + 1);
        }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [activeStep, fetchResult, completedSteps, steps.length]);

  return (
    <div className="py-6 space-y-3">
      {steps.map((step, i) => {
        const isDone = completedSteps.includes(i);
        const isActive = activeStep === i && !isDone;
        const isHidden = i > activeStep && !isDone;

        return (
          <div
            key={i}
            className="flex items-center gap-3 transition-all duration-300"
            style={{
              opacity: isHidden ? 0 : 1,
              transform: isHidden ? "translateY(8px)" : "translateY(0)",
            }}
          >
            {isDone ? (
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
            ) : isActive ? (
              <div className="w-5 h-5 rounded-full border-2 border-accent-orange border-t-transparent animate-spinner flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-bg-elevated flex-shrink-0" />
            )}

            <span
              className={`text-[13px] ${
                isDone
                  ? "text-accent-teal font-medium"
                  : isActive
                  ? "text-accent-orange font-medium"
                  : "text-text-tertiary"
              }`}
            >
              {isDone ? step.done : step.pending}
            </span>
          </div>
        );
      })}

      {/* Progress bar */}
      <div className="mt-4 h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(completedSteps.length / steps.length) * 100}%`,
            background: "linear-gradient(90deg, #F59E42, #2DD4A8)",
          }}
        />
      </div>
    </div>
  );
}
