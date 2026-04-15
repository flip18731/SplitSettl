"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { AIAnalysisResult } from "@/lib/ai";
import FetchSteps from "./FetchSteps";
import CodeScanAnimation from "./CodeScanAnimation";
import ImpactRadar from "./ImpactRadar";
import SplitStreamAnimation from "./SplitStreamAnimation";
import InvoiceReveal from "./InvoiceReveal";

type Phase = "fetching" | "scanning" | "radar" | "streaming" | "invoice";

/** Minimum time on the code-scan view so it does not flash past before the next phase. */
const MIN_SCAN_MS = 5500;

interface Props {
  result: AIAnalysisResult | null;
  repoSlug: string;
  branch: string;
  error?: string | null;
  onApprove: () => void;
  onReset: () => void;
}

export default function AnalysisJourney({
  result,
  repoSlug,
  branch,
  error,
  onApprove,
  onReset,
}: Props) {
  const [phase, setPhase] = useState<Phase>("fetching");
  const scanStartRef = useRef(0);

  const scanExtras = useMemo(() => {
    if (!result) {
      return {
        totalLineChanges: 0,
        contributorImpactTiers: { high: 0, medium: 0, low: 0 },
      };
    }
    const totalLineChanges = result.invoice.items.reduce(
      (acc, item) => acc + item.linesAdded + item.linesDeleted,
      0
    );
    let high = 0;
    let medium = 0;
    let low = 0;
    for (const s of result.splits) {
      if (s.impactRating === "HIGH") high++;
      else if (s.impactRating === "MEDIUM") medium++;
      else low++;
    }
    return {
      totalLineChanges,
      contributorImpactTiers: { high, medium, low },
    };
  }, [result]);

  // Phase 1 → 2: only after API result exists (brief connect animation)
  useEffect(() => {
    if (phase !== "fetching") return;
    if (!result) return;
    const t = setTimeout(() => {
      setPhase("scanning");
      scanStartRef.current = Date.now();
    }, 800);
    return () => clearTimeout(t);
  }, [phase, result]);

  // Phase 2 → 3: when result available AND at least 3s of scanning elapsed
  useEffect(() => {
    if (phase !== "scanning" || !result) return;
    const elapsed = Date.now() - scanStartRef.current;
    const remaining = Math.max(0, MIN_SCAN_MS - elapsed);
    const t = setTimeout(() => setPhase("radar"), remaining);
    return () => clearTimeout(t);
  }, [phase, result]);

  // Phase 3 → 4: fired by ImpactRadar onComplete
  const handleRadarComplete = useCallback(() => setPhase("streaming"), []);

  // Phase 4 → 5: fired by SplitStreamAnimation onComplete
  const handleStreamComplete = useCallback(() => setPhase("invoice"), []);

  if (error && !result) {
    return (
      <div className="relative bg-bg-surface border border-border rounded-lg p-6 space-y-4">
        <div className="bg-accent-orange-bg border border-accent-orange/20 rounded-md px-4 py-3">
          <p className="text-[13px] font-semibold text-accent-orange">
            Analysis could not be completed
          </p>
          <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
            {error}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 rounded-md bg-transparent border border-border text-[13px] font-medium text-text-tertiary hover:text-accent-teal hover:border-accent-teal transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {error && result && (
        <div className="bg-accent-orange-bg border border-accent-orange/20 rounded-md px-4 py-2 mb-4">
          <p className="text-[12px] text-accent-orange">{error}</p>
        </div>
      )}

      {/* Phase 1: Fetch Steps */}
      {phase === "fetching" && (
        <div className="animate-fade-in space-y-3">
          <FetchSteps
            repoSlug={repoSlug}
            branch={branch}
            hasAnalysisResult={!!result}
          />
        </div>
      )}

      {/* Phase 2: Code Scan (real snippets + metrics from analysis) */}
      {phase === "scanning" && result && (
        <div className="animate-fade-in">
          <CodeScanAnimation
            commitsTotal={result.commitsAnalyzed}
            codeSnippets={result.codeSnippets}
            totalLineChanges={scanExtras.totalLineChanges}
            contributorImpactTiers={scanExtras.contributorImpactTiers}
          />
        </div>
      )}

      {/* Phase 3: Impact Radar */}
      {phase === "radar" && result && (
        <div className="animate-fade-in">
          <ImpactRadar
            splits={result.splits}
            aiSummary={result.aiSummary}
            onComplete={handleRadarComplete}
          />
        </div>
      )}

      {/* Phase 4: Split Stream */}
      {phase === "streaming" && result && (
        <div className="animate-fade-in">
          <SplitStreamAnimation
            splits={result.splits}
            total={result.invoice.total}
            currency={result.invoice.currency}
            onComplete={handleStreamComplete}
          />
        </div>
      )}

      {/* Phase 5: Invoice Reveal */}
      {phase === "invoice" && result && (
        <div className="animate-fade-in">
          <InvoiceReveal
            result={result}
            onApprove={onApprove}
            onReset={onReset}
          />
        </div>
      )}
    </div>
  );
}
