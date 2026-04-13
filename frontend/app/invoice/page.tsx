"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import RepoInput from "@/components/invoice/RepoInput";
import AnalysisLoadingSteps from "@/components/invoice/AnalysisLoadingSteps";
import CommitTimeline from "@/components/invoice/CommitTimeline";
import ContributorComparison from "@/components/invoice/ContributorComparison";
import CodeImpactRing from "@/components/invoice/CodeImpactRing";
import FileTypeBreakdown from "@/components/invoice/FileTypeBreakdown";
import ActivityHeatmap from "@/components/invoice/ActivityHeatmap";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import PaymentFlowSteps from "@/components/invoice/PaymentFlowSteps";
import type { AIAnalysisResult } from "@/lib/ai";
import { SAMPLE_RESULT } from "@/lib/sampleData";

type Stage = "input" | "loading" | "preview" | "paying" | "complete";

interface LoadingMeta {
  commitsFound?: number;
  contributorsFound?: number;
  totalLines?: number;
  totalFiles?: number;
  splitSummary?: string;
  invoiceId?: string;
}

export default function InvoicePage() {
  const [stage, setStage] = useState<Stage>("input");
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [cachedResult, setCachedResult] = useState<AIAnalysisResult>(SAMPLE_RESULT);
  const [loadingMeta, setLoadingMeta] = useState<LoadingMeta | null>(null);
  const [repoSlug, setRepoSlug] = useState("");
  const [branch, setBranch] = useState("main");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleAnalyze = async (repoUrl: string, budget: number, branchName: string) => {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/\s?#]+)/);
    if (!match) return;
    const slug = `${match[1]}/${match[2].replace(".git", "")}`;
    setRepoSlug(slug);
    setBranch(branchName);
    setStage("loading");
    setLoadingMeta(null);
    setError(null);

    abortRef.current = new AbortController();
    const timeout = setTimeout(() => {
      abortRef.current?.abort();
    }, 15000);

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, totalBudget: budget, branch: branchName }),
        signal: abortRef.current.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data: AIAnalysisResult = await response.json();

      // Fill in loading steps with real numbers
      const viz = data.visualizationData;
      const totalLines = viz.contributors.reduce(
        (s, c) => s + c.additions + c.deletions,
        0
      );
      const totalFiles = viz.contributors.reduce((s, c) => s + c.filesChanged, 0);
      const splitSummary = data.splits
        .map((s) => `${s.name.split(" ")[0]} ${s.percentage}%`)
        .join(" · ");

      setLoadingMeta({
        commitsFound: data.commitsAnalyzed,
        contributorsFound: viz.contributors.length,
        totalLines,
        totalFiles,
        splitSummary,
        invoiceId: data.invoice.id,
      });

      // Allow remaining steps to animate (rapid 300ms each)
      setTimeout(() => {
        setResult(data);
        setCachedResult(data);
        setStage("preview");
      }, 1500);
    } catch (err: unknown) {
      clearTimeout(timeout);
      const message = err instanceof Error ? err.message : "Unknown error";

      if (message === "The user aborted a request." || message.includes("abort")) {
        // Timeout — use cached result
        setError("Request timed out — using cached analysis");
        fillCachedMeta(cachedResult);
        setTimeout(() => {
          setResult(cachedResult);
          setStage("preview");
        }, 1200);
      } else {
        setError(`${message} — using cached analysis`);
        fillCachedMeta(cachedResult);
        setTimeout(() => {
          setResult(cachedResult);
          setStage("preview");
        }, 1200);
      }
    }
  };

  function fillCachedMeta(r: AIAnalysisResult) {
    const viz = r.visualizationData;
    const totalLines = viz.contributors.reduce((s, c) => s + c.additions + c.deletions, 0);
    const totalFiles = viz.contributors.reduce((s, c) => s + c.filesChanged, 0);
    setLoadingMeta({
      commitsFound: r.commitsAnalyzed,
      contributorsFound: viz.contributors.length,
      totalLines,
      totalFiles,
      splitSummary: r.splits.map((s) => `${s.name.split(" ")[0]} ${s.percentage}%`).join(" · "),
      invoiceId: r.invoice.id,
    });
  }

  const handleApprove = () => setStage("paying");

  const handlePaymentComplete = useCallback(() => setStage("complete"), []);

  const handleReset = () => {
    setStage("input");
    setResult(null);
    setError(null);
    setLoadingMeta(null);
  };

  return (
    <div className="max-w-[960px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-text-primary">
          AI Invoice Generator
        </h1>
        <p className="text-[13px] text-text-tertiary mt-1">
          Analyze a GitHub repository and let AI generate evidence-based payment splits
        </p>
      </div>

      {/* Input stage */}
      {stage === "input" && <RepoInput onSubmit={handleAnalyze} />}

      {/* Loading stage */}
      {stage === "loading" && (
        <div>
          <AnalysisLoadingSteps
            repoSlug={repoSlug}
            branch={branch}
            fetchResult={loadingMeta}
          />
          {error && (
            <p className="text-[12px] text-accent-orange mt-2">{error}</p>
          )}
        </div>
      )}

      {/* Preview stage */}
      {stage === "preview" && result && (
        <div className="space-y-5 animate-fade-in">
          {error && (
            <div className="bg-accent-orange-bg border border-accent-orange/20 rounded-md px-4 py-2">
              <p className="text-[12px] text-accent-orange">{error}</p>
            </div>
          )}

          {/* Visualization section */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary mb-4">
              Contribution analysis
            </p>
            <div className="grid grid-cols-2 gap-4">
              <CommitTimeline data={result.visualizationData} />
              <ContributorComparison data={result.visualizationData} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <CodeImpactRing data={result.visualizationData} />
              <FileTypeBreakdown data={result.visualizationData} />
            </div>
            <div className="mt-4">
              <ActivityHeatmap data={result.visualizationData} />
            </div>
          </div>

          {/* Invoice */}
          <InvoicePreview result={result} />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-md bg-transparent border border-border text-[13px] font-medium text-text-tertiary hover:text-accent-teal hover:border-accent-teal transition-colors"
            >
              Analyze Another
            </button>
            <button
              onClick={handleApprove}
              className="flex-[2] py-3 rounded-md bg-gradient-to-br from-accent-teal to-[#22B896] text-bg-primary text-[14px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Approve & Settle
            </button>
          </div>
        </div>
      )}

      {/* Payment flow stage */}
      {stage === "paying" && result && (
        <div className="bg-bg-surface border border-border rounded-lg p-6 animate-fade-in">
          <p className="text-[13px] font-semibold text-text-primary mb-1">
            Processing via HSP
          </p>
          <p className="text-[11px] text-text-tertiary mb-4">
            ${result.invoice.total.toLocaleString()} {result.invoice.currency} to{" "}
            {result.splits.length} contributors
          </p>

          <PaymentFlowSteps
            steps={[
              {
                label: "Creating HSP payment request...",
                description: `Registering $${result.invoice.total.toLocaleString()} on HSP protocol`,
              },
              {
                label: "Processing payment split...",
                description: result.splits
                  .map(
                    (s) =>
                      `$${((result.invoice.total * s.percentage) / 100).toFixed(0)} to ${s.name}`
                  )
                  .join(", "),
              },
              {
                label: "Confirming on HashKey Chain...",
                description: "Waiting for on-chain confirmation",
              },
              {
                label: "Generating HSP receipt...",
                description: "HSP flow complete — receipt stored on-chain",
              },
            ]}
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
            ${result.invoice.total.toLocaleString()} {result.invoice.currency}{" "}
            split to {result.splits.length} contributors
          </p>

          <div className="bg-bg-surface border border-border rounded-lg p-5 max-w-md mx-auto mb-6 text-left">
            {result.splits.map((split, i) => (
              <div
                key={i}
                className={`flex justify-between py-2 ${
                  i < result.splits.length - 1 ? "border-b border-bg-elevated" : ""
                }`}
              >
                <span className="text-[13px] text-text-secondary">{split.name}</span>
                <span className="text-[13px] font-semibold text-accent-teal">
                  ${((result.invoice.total * split.percentage) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-text-tertiary mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
            HSP receipt issued — settlement recorded on HashKey Chain
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
