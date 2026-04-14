"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import RepoInput from "@/components/invoice/RepoInput";
import AnalysisJourney from "@/components/invoice/AnalysisJourney";
import OnChainSettlement from "@/components/invoice/OnChainSettlement";
import type { AIAnalysisResult } from "@/lib/ai";
import { explorerTxUrl } from "@/lib/explorer";
import { formatNumberEnUS } from "@/lib/format";

type Stage = "input" | "analyzing" | "paying" | "complete";

export default function InvoicePage() {
  const [stage, setStage] = useState<Stage>("input");
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [repoSlug, setRepoSlug] = useState("");
  const [branch, setBranch] = useState("main");
  const [error, setError] = useState<string | null>(null);
  const [settlementTx, setSettlementTx] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleAnalyze = async (
    repoUrl: string,
    budget: number,
    branchName: string
  ) => {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
    if (!match) return;
    const slug = `${match[1]}/${match[2].replace(".git", "")}`;
    setRepoSlug(slug);
    setBranch(branchName);
    setStage("analyzing");
    setResult(null);
    setError(null);

    abortRef.current = new AbortController();
    const timeout = setTimeout(() => {
      abortRef.current?.abort();
    }, 120000);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl,
          totalBudget: budget,
          branch: branchName,
        }),
        signal: abortRef.current.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data: AIAnalysisResult = await response.json();
      setResult(data);
    } catch (err: unknown) {
      clearTimeout(timeout);
      const message = err instanceof Error ? err.message : "Unknown error";

      if (
        message === "The user aborted a request." ||
        message.includes("abort")
      ) {
        setError(
          "Request was cancelled or timed out (2 min). Try again, or use a smaller branch."
        );
      } else {
        setError(message);
      }
      setResult(null);
    }
  };

  const handleApprove = useCallback(() => setStage("paying"), []);
  const handlePaymentComplete = useCallback((txHash?: string) => {
    if (txHash) setSettlementTx(txHash);
    setStage("complete");
  }, []);

  const handleReset = () => {
    setStage("input");
    setResult(null);
    setError(null);
    setSettlementTx(null);
  };

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-text-primary">
          AI Invoice Generator
        </h1>
        <p className="text-[13px] text-text-tertiary mt-1">
          Analyze a GitHub repository and let AI generate evidence-based payment
          splits
        </p>
      </div>

      {/* Input stage */}
      {stage === "input" && <RepoInput onSubmit={handleAnalyze} />}

      {/* Analysis journey (phases 1-5) */}
      {stage === "analyzing" && (
        <AnalysisJourney
          result={result}
          repoSlug={repoSlug}
          branch={branch}
          error={error}
          onApprove={handleApprove}
          onReset={handleReset}
        />
      )}

      {/* Payment flow stage */}
      {stage === "paying" && result && (
        <div className="bg-bg-surface border border-border rounded-lg p-6 animate-fade-in space-y-4">
          <div>
            <p className="text-[13px] font-semibold text-text-primary mb-1">
              Settle with HSP + ERC20
            </p>
            <p className="text-[11px] text-text-tertiary">
              ${formatNumberEnUS(result.invoice.total)} {result.invoice.currency}{" "}
              to {result.splits.length} contributors
            </p>
          </div>
          <OnChainSettlement
            result={result}
            onComplete={handlePaymentComplete}
          />
        </div>
      )}

      {/* Complete stage */}
      {stage === "complete" && result && (
        <div className="text-center py-12 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-accent-teal-bg flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 12L10 16L18 8"
                stroke="#2DD4A8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 className="text-[20px] font-semibold text-text-primary mb-1">
            Settlement Complete
          </h2>
          <p className="text-[13px] text-text-tertiary mb-6">
            ${formatNumberEnUS(result.invoice.total)} {result.invoice.currency}{" "}
            split to {result.splits.length} contributors
          </p>

          <div className="bg-bg-surface border border-border rounded-lg p-5 max-w-md mx-auto mb-6 text-left">
            {result.splits.map((split, i) => (
              <div
                key={i}
                className={`flex justify-between py-2 ${
                  i < result.splits.length - 1
                    ? "border-b border-bg-elevated"
                    : ""
                }`}
              >
                <span className="text-[13px] text-text-secondary">
                  {split.name}
                </span>
                <span className="text-[13px] font-semibold text-accent-teal">
                  $
                  {((result.invoice.total * split.percentage) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2 text-[11px] text-text-tertiary mb-6">
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
              HSP receipt issued — settlement recorded on HashKey Chain
            </div>
            {settlementTx && (
              <a
                href={explorerTxUrl(settlementTx)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-teal font-mono text-[11px] hover:underline"
              >
                View transaction
              </a>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-md bg-gradient-to-br from-accent-teal to-[#22B896] text-bg-primary text-[13px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              View on Dashboard
            </Link>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-md bg-transparent border border-border text-[13px] font-medium text-text-tertiary hover:text-accent-teal hover:border-accent-teal transition-colors"
            >
              New Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
