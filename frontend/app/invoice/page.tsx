"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import RepoInput from "@/components/invoice/RepoInput";
import AnalysisJourney from "@/components/invoice/AnalysisJourney";
import OnChainSettlement from "@/components/invoice/OnChainSettlement";
import HspPaymentLifecycle from "@/components/invoice/HspPaymentLifecycle";
import type { AIAnalysisResult } from "@/lib/ai";
import { explorerTxUrl } from "@/lib/explorer";
import { displayFirstName, formatNumberEnUS } from "@/lib/format";

type Stage = "input" | "analyzing" | "paying" | "complete";

function extractHspStatus(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  const inner = o.data;
  if (Array.isArray(inner) && inner[0] && typeof inner[0] === "object") {
    const s = (inner[0] as Record<string, unknown>).status;
    if (typeof s === "string") return s;
  }
  if (inner && typeof inner === "object" && "status" in inner) {
    const s = (inner as Record<string, unknown>).status;
    if (typeof s === "string") return s;
  }
  if (typeof o.status === "string") return o.status;
  return null;
}

export default function InvoicePage() {
  const [stage, setStage] = useState<Stage>("input");
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [repoSlug, setRepoSlug] = useState("");
  const [branch, setBranch] = useState("main");
  const [error, setError] = useState<string | null>(null);
  const [settlementTx, setSettlementTx] = useState<string | null>(null);
  const [completeVia, setCompleteVia] = useState<"hsp" | "chain" | null>(null);

  const [hspLoading, setHspLoading] = useState(false);
  const [hspPaymentUrl, setHspPaymentUrl] = useState<string | null>(null);
  const [hspError, setHspError] = useState<string | null>(null);
  const [hspCartId, setHspCartId] = useState<string | null>(null);
  const [hspPollStatus, setHspPollStatus] = useState<string | null>(null);
  const [hspFailed, setHspFailed] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

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
        throw new Error(
          (errData as { error?: string }).error || `HTTP ${response.status}`
        );
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

  const handleApprove = useCallback(() => {
    setHspPaymentUrl(null);
    setHspError(null);
    setHspCartId(null);
    setHspPollStatus(null);
    setHspFailed(false);
    stopPoll();
    setStage("paying");
  }, [stopPoll]);

  const handleHSPPayment = async () => {
    if (!result) return;
    setHspLoading(true);
    setHspError(null);
    setHspFailed(false);
    try {
      const payTo =
        typeof process !== "undefined"
          ? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
          : undefined;
      const res = await fetch("/api/hsp/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice: result.invoice,
          payTo,
        }),
      });
      const data = (await res.json()) as {
        fallback?: boolean;
        message?: string;
        paymentUrl?: string;
        cartMandateId?: string;
        error?: string;
      };

      if (data.fallback || !res.ok) {
        // API sends both: `error` (specific) and `message` (generic fallback copy)
        setHspError(data.error || data.message || "HSP gateway unavailable");
        return;
      }

      if (data.paymentUrl) {
        setHspPaymentUrl(data.paymentUrl);
        setHspCartId(data.cartMandateId || result.invoice.id);
        window.open(data.paymentUrl, "_blank", "noopener,noreferrer");
      } else {
        setHspError("No checkout URL returned from HSP");
      }
    } catch {
      setHspError("HSP gateway unavailable");
    } finally {
      setHspLoading(false);
    }
  };

  useEffect(() => {
    if (stage !== "paying" || !hspCartId || !hspPaymentUrl) {
      stopPoll();
      return;
    }

    const tick = async () => {
      try {
        const res = await fetch(
          `/api/hsp/status?cart_mandate_id=${encodeURIComponent(hspCartId)}`
        );
        const data = await res.json();
        const st = extractHspStatus(data);
        if (st) setHspPollStatus(st);

        if (st?.includes("successful")) {
          stopPoll();
          setCompleteVia("hsp");
          setStage("complete");
        } else if (st?.includes("failed")) {
          stopPoll();
          setHspFailed(true);
        }
      } catch {
        /* keep polling */
      }
    };

    void tick();
    pollRef.current = setInterval(tick, 5000);
    const max = setTimeout(() => stopPoll(), 600_000);

    return () => {
      stopPoll();
      clearTimeout(max);
    };
  }, [stage, hspCartId, hspPaymentUrl, stopPoll]);

  const handlePaymentComplete = useCallback((txHash?: string) => {
    if (txHash) setSettlementTx(txHash);
    setCompleteVia("chain");
    setStage("complete");
  }, []);

  const handleReset = () => {
    stopPoll();
    setStage("input");
    setResult(null);
    setError(null);
    setSettlementTx(null);
    setCompleteVia(null);
    setHspPaymentUrl(null);
    setHspError(null);
    setHspCartId(null);
    setHspPollStatus(null);
    setHspFailed(false);
  };

  return (
    <div className="max-w-[960px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[20px] font-semibold text-text-primary">
          AI Invoice Generator
        </h1>
        <p className="text-[13px] text-text-tertiary mt-1">
          Analyze a GitHub repository and let AI generate evidence-based payment
          splits
        </p>
      </div>

      {stage === "input" && <RepoInput onSubmit={handleAnalyze} />}

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

      {stage === "paying" && result && (
        <div className="bg-bg-surface border border-border rounded-lg p-6 animate-fade-in space-y-5">
          <div>
            <p className="text-[13px] font-semibold text-text-primary mb-1">
              Settlement
            </p>
            <p className="text-[11px] text-text-tertiary">
              ${formatNumberEnUS(result.invoice.total)} {result.invoice.currency}{" "}
              to {result.splits.length} contributors
            </p>
          </div>

          <div className="rounded-lg border border-accent-teal/25 bg-bg-elevated/40 p-4 space-y-4">
            <p className="text-[12px] font-semibold text-text-primary">
              Pay via HSP Gateway
            </p>
            <p className="text-[11px] text-text-tertiary leading-relaxed">
              Real HashKey Merchant API — cart mandate and x402 checkout. Opens
              in a new tab; status updates every 5s.
            </p>
            <button
              type="button"
              onClick={handleHSPPayment}
              disabled={hspLoading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-[14px] bg-gradient-to-r from-accent-teal to-[#22B896] text-bg-primary hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex flex-wrap items-center justify-center gap-2"
            >
              {hspLoading ? "Creating HSP order…" : "Pay via HSP Gateway"}
              <span className="text-[10px] opacity-80 uppercase tracking-wider font-semibold">
                Recommended
              </span>
            </button>

            {hspPaymentUrl && (
              <div className="mt-2 space-y-3 p-4 rounded-lg bg-bg-primary border border-border">
                <div className="flex items-center gap-2 text-[12px] text-accent-orange">
                  <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
                  Waiting for HSP payment confirmation…
                </div>
                <HspPaymentLifecycle status={hspPollStatus} failed={hspFailed} />
                <a
                  href={hspPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-text-tertiary hover:text-accent-teal block"
                >
                  Reopen checkout →
                </a>
              </div>
            )}

            {hspError && (
              <p className="text-[11px] text-text-tertiary">
                {hspError} — use{" "}
                <span className="text-text-secondary">Direct Wallet Settlement</span>{" "}
                below.
              </p>
            )}
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              Direct wallet settlement
            </p>
            <p className="text-[11px] text-text-tertiary leading-relaxed">
              MetaMask → approve ERC-20 →{" "}
              <code className="text-accent-teal">submitPaymentERC20</code> on
              SplitSettl (on-chain HSP-shaped lifecycle).
            </p>
            <OnChainSettlement
              result={result}
              onComplete={handlePaymentComplete}
            />
          </div>
        </div>
      )}

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
            {completeVia === "hsp" ? "HSP payment complete" : "Settlement complete"}
          </h2>
          <p className="text-[13px] text-text-tertiary mb-6">
            ${formatNumberEnUS(result.invoice.total)} {result.invoice.currency}{" "}
            split to {result.splits.length} contributors
          </p>
          {completeVia === "hsp" && (
            <p className="text-[12px] text-text-secondary mb-4 max-w-md mx-auto">
              Confirmed via HashKey Merchant Gateway (HSP). Webhook events are
              logged server-side at{" "}
              <code className="text-[10px] text-accent-teal">/api/hsp/webhook</code>.
            </p>
          )}

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
                  {displayFirstName(split.name)}
                </span>
                <span className="text-[13px] font-semibold text-accent-teal">
                  $
                  {((result.invoice.total * split.percentage) / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2 text-[11px] text-text-tertiary mb-6">
            {completeVia === "chain" && (
              <>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                  HSP receipt issued — settlement on HashKey Chain
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
              </>
            )}
            {completeVia === "hsp" && (
              <p className="text-[11px] text-text-tertiary">
                On-chain tx may appear in your wallet history after gateway settlement.
              </p>
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
              type="button"
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
