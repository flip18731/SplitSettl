"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AIAnalysisResult } from "@/lib/ai";
import FetchSteps from "./FetchSteps";
import CodeScanAnimation from "./CodeScanAnimation";
import ImpactRadar from "./ImpactRadar";
import SplitStreamAnimation from "./SplitStreamAnimation";
import InvoiceReveal from "./InvoiceReveal";

type Phase = "fetching" | "scanning" | "radar" | "streaming" | "invoice";

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

  // Phase 1 → 2: auto-advance after 2s
  useEffect(() => {
    if (phase !== "fetching") return;
    const t = setTimeout(() => {
      setPhase("scanning");
      scanStartRef.current = Date.now();
    }, 2000);
    return () => clearTimeout(t);
  }, [phase]);

  // Phase 2 → 3: when result available AND at least 3s of scanning elapsed
  useEffect(() => {
    if (phase !== "scanning" || !result) return;
    const elapsed = Date.now() - scanStartRef.current;
    const remaining = Math.max(0, 3000 - elapsed);
    const t = setTimeout(() => setPhase("radar"), remaining);
    return () => clearTimeout(t);
  }, [phase, result]);

  // Phase 3 → 4: fired by ImpactRadar onComplete
  const handleRadarComplete = useCallback(() => setPhase("streaming"), []);

  // Phase 4 → 5: fired by SplitStreamAnimation onComplete
  const handleStreamComplete = useCallback(() => setPhase("invoice"), []);

  return (
    <div className="relative">
      {/* Error banner */}
      {error && (
        <div className="bg-accent-orange-bg border border-accent-orange/20 rounded-md px-4 py-2 mb-4">
          <p className="text-[12px] text-accent-orange">{error}</p>
        </div>
      )}

      {/* Phase 1: Fetch Steps */}
      {phase === "fetching" && (
        <div className="animate-fade-in">
          <FetchSteps repoSlug={repoSlug} branch={branch} />
        </div>
      )}

      {/* Phase 2: Code Scan */}
      {phase === "scanning" && (
        <div className="animate-fade-in">
          <CodeScanAnimation
            commitsTotal={result?.commitsAnalyzed || 47}
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
