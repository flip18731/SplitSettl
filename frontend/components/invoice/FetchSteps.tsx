"use client";

import { useState, useEffect } from "react";
import AnalysisPipelineVisual from "./AnalysisPipelineVisual";

interface Props {
  repoSlug: string;
  branch: string;
  /** false until /api/ai/analyze returns */
  hasAnalysisResult?: boolean;
}

export default function FetchSteps({
  repoSlug,
  branch,
  hasAnalysisResult = false,
}: Props) {
  const [step1Done, setStep1Done] = useState(false);
  const [step2Visible, setStep2Visible] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Visible, setStep3Visible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStep1Done(true);
      setStep2Visible(true);
    }, 700);

    const t2 = setTimeout(() => {
      setStep2Done(true);
      setStep3Visible(true);
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const showAiPending = step3Visible && !hasAnalysisResult;
  const showAiDone = step3Visible && hasAnalysisResult;

  return (
    <div className="relative">
      {/* Ambient layers */}
      <div
        className="pointer-events-none absolute -inset-px rounded-lg analysis-ambient-glow bg-gradient-to-br from-accent-teal/10 via-transparent to-accent-orange/10 opacity-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-lg bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(45,212,168,0.12),transparent)]"
        aria-hidden
      />

      <div className="relative bg-bg-surface/95 border border-border rounded-lg p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute h-8 w-8 rounded-full border border-accent-teal/30 animate-ping opacity-40" />
            <span className="relative flex h-3 w-3 rounded-full bg-accent-teal shadow-[0_0_12px_rgba(45,212,168,0.6)]" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-text-primary tracking-tight">
              Repository analysis
            </p>
            <p className="text-[11px] text-text-tertiary font-mono">{repoSlug}</p>
          </div>
        </div>

        <div className="mb-6">
          <AnalysisPipelineVisual complete={hasAnalysisResult} />
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
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
                : "Connecting to GitHub…"}
            </span>
          </div>

          {/* Step 2 */}
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
                ? `Loaded commit history (${branch})`
                : `Reading commits from ${branch}…`}
            </span>
          </div>

          {/* Step 3 — AI / long wait */}
          <div
            className="flex items-start gap-3 transition-all duration-500"
            style={{
              opacity: step3Visible ? 1 : 0,
              transform: step3Visible ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {showAiDone ? (
              <div className="w-5 h-5 rounded-full bg-accent-teal-bg flex items-center justify-center flex-shrink-0 mt-0.5">
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
            ) : showAiPending ? (
              <div className="w-5 h-5 rounded-full border-2 border-accent-orange border-t-transparent animate-spinner flex-shrink-0 mt-0.5" />
            ) : (
              <div className="w-5 h-5 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p
                className={`text-[13px] font-medium ${
                  showAiDone ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {showAiDone
                  ? "Payment split ready"
                  : showAiPending
                  ? "AI is scoring impact & building the invoice…"
                  : "Preparing analysis…"}
              </p>
              {showAiPending && (
                <p className="text-[11px] text-text-tertiary mt-1 leading-relaxed">
                  This can take up to a minute while we fetch diffs and call the
                  model. You can keep this tab open.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
