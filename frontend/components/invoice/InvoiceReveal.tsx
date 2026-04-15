"use client";

import type { AIAnalysisResult } from "@/lib/ai";
import ImpactBadge from "./shared/ImpactBadge";
import MiniRadar from "./shared/MiniRadar";
import EvidenceLink from "./shared/EvidenceLink";
import WalletAddressProvenance from "./shared/WalletAddressProvenance";
import { shortenAddress } from "@/lib/wallet";
import { displayFirstName, formatNumberEnUS } from "@/lib/format";

const RANK_COLORS = ["#2DD4A8", "#F59E42", "#8B93A8", "rgba(45,212,168,0.5)", "#5A6275"];

interface Props {
  result: AIAnalysisResult;
  onApprove: () => void;
  onReset: () => void;
}

export default function InvoiceReveal({ result, onApprove, onReset }: Props) {
  const { invoice, splits } = result;
  const date = new Date(invoice.generatedAt);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Sort splits by percentage for color assignment
  const sortedSplits = [...splits].sort((a, b) => b.percentage - a.percentage);
  const colorMap: Record<string, string> = {};
  sortedSplits.forEach((s, i) => {
    colorMap[s.name] = RANK_COLORS[Math.min(i, RANK_COLORS.length - 1)];
  });

  return (
    <div className="space-y-5 animate-fade-slide-in">
      {/* Invoice card */}
      <div className="bg-bg-surface border border-border rounded-lg overflow-hidden">
        {/* Invoice header */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <a
              href={`https://github.com/${invoice.project}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-mono text-accent-teal hover:underline"
            >
              {invoice.project}
            </a>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-bg-elevated border border-border text-text-tertiary font-mono">
              {result.branch}
            </span>
            <span className="text-[10px] text-text-tertiary">
              {result.commitsAnalyzed} commits analyzed
            </span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[28px] font-bold text-text-primary leading-none mb-1">
                <span className="text-accent-teal">$</span>
                {formatNumberEnUS(invoice.total)}
                <span className="text-[14px] font-normal text-text-tertiary ml-2">
                  {invoice.currency}
                </span>
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] font-semibold uppercase tracking-[1px] bg-accent-orange-bg text-accent-orange px-2 py-0.5 rounded-full">
                  AI-generated
                </span>
                {result.hasAddressConfig && (
                  <span className="text-[11px] font-semibold uppercase tracking-[1px] bg-accent-teal-bg text-accent-teal px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-accent-teal inline-block" />
                    Auto-configured
                  </span>
                )}
                <span className="text-[11px] text-text-tertiary">{dateStr}</span>
              </div>
              {result.analysisSource === "fallback" && (
                <p className="text-[11px] text-accent-orange mt-3 leading-relaxed max-w-xl">
                  <strong>Fallback-Modus:</strong> OpenAI hat nicht erfolgreich geantwortet (oder kein API-Key) —
                  Splits stammen aus Zeilenstatistik + Heuristik. Prüfe{" "}
                  <code className="text-[10px] bg-bg-elevated px-1 rounded">OPENAI_API_KEY</code> in{" "}
                  <code className="text-[10px] bg-bg-elevated px-1 rounded">frontend/.env.local</code>, optional{" "}
                  <code className="text-[10px] bg-bg-elevated px-1 rounded">AI_ANALYSIS_PROVIDER=openai|auto</code>, und
                  Server-Neustart.
                  {result.analysisError && (
                    <span className="block font-mono text-[10px] mt-1.5 text-text-secondary break-all">
                      {result.analysisError}
                    </span>
                  )}
                </p>
              )}
              {result.analysisSource === "openai" && (
                <p className="text-[10px] text-text-tertiary mt-2 font-mono">
                  Analyse: OpenAI
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[13px] font-mono font-semibold text-text-primary">
                {invoice.id}
              </p>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                HSP Settlement
              </p>
            </div>
          </div>
        </div>

        {/* Line items table */}
        <div className="px-6 py-4">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-[1px] text-text-tertiary">
                <th className="text-left pb-3 pr-4">Contributor</th>
                <th className="text-left pb-3 pr-4">Work Summary</th>
                <th className="text-right pb-3 pr-4">Impact</th>
                <th className="text-right pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => {
                const split = splits.find((s) => s.name === item.contributor);
                const color = colorMap[item.contributor] || "#5A6275";
                return (
                  <tr
                    key={i}
                    className="border-t border-bg-elevated align-top"
                  >
                    {/* Contributor cell with mini radar */}
                    <td className="py-3 pr-4">
                      <div className="flex items-start gap-2">
                        {split && (
                          <MiniRadar
                            scores={split.impactScores}
                            color={color}
                          />
                        )}
                        <div>
                          <p className="text-[13px] font-semibold text-text-primary">
                            {displayFirstName(item.contributor)}
                          </p>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            {item.commits} commits &middot; +
                            {formatNumberEnUS(item.linesAdded)} / -
                            {formatNumberEnUS(item.linesDeleted)}
                          </p>
                          {split?.walletAddress && (
                            <div className="mt-0.5">
                              <p className="text-[10px] font-mono text-text-tertiary flex items-center gap-1">
                                <span
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: color }}
                                />
                                {shortenAddress(split.walletAddress)}
                              </p>
                              <WalletAddressProvenance
                                split={split}
                                repoSlug={result.repository}
                                compact
                              />
                            </div>
                          )}
                          <div className="mt-1">
                            <ImpactBadge rating={item.impactRating} />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Work summary + evidence */}
                    <td className="py-3 pr-4">
                      <p className="text-[12px] text-text-secondary">
                        {item.description}
                      </p>

                      {/* Top files */}
                      {item.topFiles && item.topFiles.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {item.topFiles.map((f, fi) => (
                            <span
                              key={fi}
                              className="text-[10px] font-mono text-text-secondary bg-bg-elevated rounded px-2 py-0.5"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Evidence links */}
                      {split?.keyEvidence && split.keyEvidence.length > 0 && (
                        <div className="mt-2 space-y-0.5">
                          <p className="text-[9px] font-semibold uppercase tracking-[1px] text-text-tertiary">
                            Evidence
                          </p>
                          {split.keyEvidence.map((ev, ei) => (
                            <EvidenceLink
                              key={ei}
                              evidence={ev}
                              repoSlug={invoice.project}
                            />
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Impact score */}
                    <td className="py-3 pr-4 text-right">
                      {split && (
                        <span
                          className="inline-block text-[12px] font-semibold px-2 py-0.5 rounded"
                          style={{
                            color,
                            backgroundColor: `${color}18`,
                          }}
                        >
                          {Math.round(
                            split.impactScores.complexity * 0.3 +
                              split.impactScores.featureImpact * 0.3 +
                              split.impactScores.scopeBreadth * 0.15 +
                              split.impactScores.consistency * 0.15 +
                              split.impactScores.volume * 0.1
                          )}
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 text-right">
                      <span className="text-[13px] font-semibold text-accent-teal">
                        ${formatNumberEnUS(item.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Total row */}
          <div className="flex items-center justify-between pt-3 mt-1 border-t-2 border-accent-teal">
            <span className="text-[13px] font-semibold text-text-primary">
              Total
            </span>
            <span className="text-[20px] font-bold text-accent-teal">
              ${formatNumberEnUS(invoice.total)} {invoice.currency}
            </span>
          </div>
        </div>

        {/* AI Split Rationale */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-text-tertiary mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
            AI Split Rationale
          </p>
          <div className="space-y-3">
            {splits.map((split, i) => {
              const color = colorMap[split.name] || "#5A6275";
              return (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[13px] font-semibold text-text-primary">
                      {displayFirstName(split.name)}
                    </span>
                    <span
                      className="text-[12px] font-bold"
                      style={{ color }}
                    >
                      {split.percentage}%
                    </span>
                    <ImpactBadge rating={split.impactRating} />
                    {split.walletAddress && (
                      <span className="text-[10px] font-mono text-text-tertiary bg-bg-elevated rounded px-1.5 py-0.5">
                        {shortenAddress(split.walletAddress)}
                      </span>
                    )}
                  </div>
                  {split.walletAddress && (
                    <div className="mb-2">
                      <WalletAddressProvenance
                        split={split}
                        repoSlug={result.repository}
                      />
                    </div>
                  )}
                  <p className="text-[12px] text-text-secondary italic leading-relaxed">
                    {split.justification}
                  </p>
                  {split.keyContributions &&
                    split.keyContributions.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {split.keyContributions.map((kc, ki) => (
                          <span
                            key={ki}
                            className="text-[10px] text-text-tertiary bg-bg-elevated rounded px-2 py-0.5"
                          >
                            {kc}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-md bg-transparent border border-border text-[13px] font-medium text-text-tertiary hover:text-accent-teal hover:border-accent-teal transition-colors"
        >
          Analyze Another
        </button>
        <button
          onClick={onApprove}
          className="flex-[2] py-3 rounded-md bg-gradient-to-br from-accent-teal to-[#22B896] text-bg-primary text-[14px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Approve &amp; Settle
        </button>
      </div>
    </div>
  );
}
