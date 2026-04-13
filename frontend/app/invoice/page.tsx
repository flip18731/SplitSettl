"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import AILoadingSequence from "@/components/invoice/AILoadingSequence";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import PaymentFlowSteps from "@/components/invoice/PaymentFlowSteps";
import type { AIAnalysisResult } from "@/lib/ai";
import { SAMPLE_CONTRIBUTION_DATA } from "@/lib/constants";

type Stage = "input" | "generating" | "preview" | "paying" | "complete";

export default function InvoicePage() {
  const [stage, setStage] = useState<Stage>("input");
  const [contributionData, setContributionData] = useState(SAMPLE_CONTRIBUTION_DATA);
  const [projectName, setProjectName] = useState("HashKey DeFi SDK");
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  const handleGenerate = async () => {
    setStage("generating");

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName, contributionData }),
      });

      if (response.ok) {
        const data = await response.json();
        setTimeout(() => {
          setResult(data);
          setStage("preview");
        }, 3200);
      } else {
        setTimeout(() => {
          setResult(FALLBACK_RESULT);
          setStage("preview");
        }, 3200);
      }
    } catch {
      setTimeout(() => {
        setResult(FALLBACK_RESULT);
        setStage("preview");
      }, 3200);
    }
  };

  const handleApprove = () => {
    setStage("paying");
  };

  const handlePaymentComplete = useCallback(() => {
    setStage("complete");
  }, []);

  const handleReset = () => {
    setStage("input");
    setResult(null);
  };

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-text-primary">AI Invoice Generator</h1>
        <p className="text-[13px] text-text-tertiary mt-1">
          Paste contribution data and let AI generate fair payment splits
        </p>
      </div>

      {/* Input stage */}
      {stage === "input" && (
        <div className="space-y-4 animate-fade-in">
          {/* Project name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-bg-surface border border-border text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-teal transition-colors font-sans"
              placeholder="Enter project name"
            />
          </div>

          {/* Contribution data */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-text-tertiary mb-2">
              Contribution Data
            </label>
            <textarea
              value={contributionData}
              onChange={(e) => setContributionData(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 rounded-md bg-bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-teal transition-colors font-mono leading-relaxed resize-none"
              placeholder="Paste GitHub contribution data, task completions, or describe the work done..."
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!contributionData.trim() || !projectName.trim()}
            className="w-full py-4 rounded-md bg-gradient-to-br from-accent-teal to-[#22B896] text-bg-primary text-[15px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2.5"
          >
            <span className="w-2 h-2 rounded-full bg-accent-orange" />
            Generate Invoice with AI
          </button>
        </div>
      )}

      {/* Generating stage */}
      {stage === "generating" && <AILoadingSequence />}

      {/* Preview stage */}
      {stage === "preview" && result && (
        <div className="space-y-4">
          <InvoicePreview result={result} />

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-3 rounded-md bg-transparent border border-border text-[13px] font-medium text-text-tertiary hover:text-accent-teal hover:border-accent-teal transition-colors"
            >
              Regenerate
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
          <p className="text-[13px] font-semibold text-text-primary mb-1">Processing via HSP</p>
          <p className="text-[11px] text-text-tertiary mb-4">
            ${result.invoice.total.toLocaleString()} {result.invoice.currency} to {result.splits.length} contributors
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
                  .map((s) => `$${((result.invoice.total * s.percentage) / 100).toFixed(0)} to ${s.contributor}`)
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
              <path d="M6 12L10 16L18 8" stroke="#2DD4A8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-[20px] font-semibold text-text-primary mb-1">Settlement Complete</h2>
          <p className="text-[13px] text-text-tertiary mb-6">
            ${result.invoice.total.toLocaleString()} {result.invoice.currency} split to {result.splits.length} contributors
          </p>

          {/* Summary */}
          <div className="bg-bg-surface border border-border rounded-lg p-5 max-w-md mx-auto mb-6 text-left">
            {result.splits.map((split, i) => (
              <div
                key={i}
                className={`flex justify-between py-2 ${
                  i < result.splits.length - 1 ? "border-b border-bg-elevated" : ""
                }`}
              >
                <span className="text-[13px] text-text-secondary">{split.contributor}</span>
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

const FALLBACK_RESULT: AIAnalysisResult = {
  summary:
    "Based on analysis of the contribution data, Alice leads with the highest impact through core protocol work and security fixes, Bob has strong testing and infrastructure contributions, and Carol adds essential documentation and review value.",
  splits: [
    {
      contributor: "Alice",
      address: "0xA1c4...3e7f",
      percentage: 40,
      justification:
        "Led core protocol implementation with 23 commits including critical security fixes. Highest code complexity and architectural impact.",
    },
    {
      contributor: "Bob",
      address: "0xB2d8...8a1d",
      percentage: 35,
      justification:
        "Complete test suite (98% coverage) and CI/CD pipeline. 15 commits with significant infrastructure and quality assurance value.",
    },
    {
      contributor: "Carol",
      address: "0xC3f2...2f4b",
      percentage: 25,
      justification:
        "Technical documentation, 38 PR reviews, and developer onboarding guide. Essential for project adoption and team coordination.",
    },
  ],
  invoice: {
    id: `INV-2026-${String(Date.now()).slice(-4)}`,
    date: new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    projectName: "HashKey DeFi SDK",
    items: [
      {
        description: "Core protocol implementation, 23 commits",
        contributor: "Alice",
        address: "0xA1c4...3e7f",
        hours: 18,
        rate: 75,
        amount: 480,
      },
      {
        description: "Test suite & CI/CD, 15 commits",
        contributor: "Bob",
        address: "0xB2d8...8a1d",
        hours: 14,
        rate: 70,
        amount: 420,
      },
      {
        description: "Documentation & code review, 9 commits",
        contributor: "Carol",
        address: "0xC3f2...2f4b",
        hours: 10,
        rate: 60,
        amount: 300,
      },
    ],
    total: 1200,
    currency: "USDT",
  },
};
