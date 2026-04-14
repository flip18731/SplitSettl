"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { CodePatch } from "@/lib/ai";
import { formatNumberEnUS } from "@/lib/format";

interface CodeLine {
  text: string;
  impact: "high" | "medium" | "low";
}

interface Snippet {
  file: string;
  author: string;
  lines: CodeLine[];
}

const IMPACT_COLORS = {
  high: "#2DD4A8",
  medium: "#F59E42",
  low: "#5A6275",
};

function classifyLineImpact(text: string): CodeLine["impact"] {
  const t = text.trimStart();
  if (/^@@|^diff |^index |^--- |^\+\+\+|^Binary files/.test(t)) return "low";
  if (
    /\b(contract|function|class|def |impl |async fn|struct |mapping|event |error |require)\b/i.test(
      text
    )
  )
    return "high";
  if (/^\+|^\-/.test(text)) return "medium";
  return "low";
}

function patchToSnippet(patch: CodePatch): Snippet {
  const rawLines = patch.code.split("\n").slice(0, 32);
  const lines: CodeLine[] = rawLines.map((text) => ({
    text: text.length > 220 ? `${text.slice(0, 217)}…` : text,
    impact: classifyLineImpact(text),
  }));
  if (lines.length === 0) {
    return {
      file: patch.file,
      author: patch.author,
      lines: [{ text: "(empty diff excerpt)", impact: "low" }],
    };
  }
  return { file: patch.file, author: patch.author, lines };
}

function buildSnippetsFromPatches(patches: CodePatch[]): Snippet[] {
  if (!patches.length) {
    return [
      {
        file: "—",
        author: "—",
        lines: [
          {
            text: "No diff preview available (no patch data in analyzed commits).",
            impact: "low",
          },
        ],
      },
    ];
  }
  return patches.map(patchToSnippet);
}

interface Props {
  commitsTotal: number;
  codeSnippets: CodePatch[];
  /** Sum of lines added + deleted across invoice items (from analysis) */
  totalLineChanges: number;
  /** Contributors per impact tier from AI split */
  contributorImpactTiers: { high: number; medium: number; low: number };
}

export default function CodeScanAnimation({
  commitsTotal,
  codeSnippets,
  totalLineChanges,
  contributorImpactTiers,
}: Props) {
  const snippets = useMemo(
    () => buildSnippetsFromPatches(codeSnippets),
    [codeSnippets]
  );

  const [currentSnippet, setCurrentSnippet] = useState(0);
  const [coloredLines, setColoredLines] = useState<Set<number>>(new Set());
  const [scanKey, setScanKey] = useState(0);
  const [scannedCommits, setScannedCommits] = useState(0);
  const [evaluatedLines, setEvaluatedLines] = useState(0);
  const [impactCounts, setImpactCounts] = useState({
    high: 0,
    medium: 0,
    low: 0,
  });
  const snippetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const safeCommits = Math.max(1, commitsTotal);
  const lineTarget = Math.max(0, totalLineChanges);

  useEffect(() => {
    setCurrentSnippet(0);
    setColoredLines(new Set());
    setScanKey((k) => k + 1);
  }, [codeSnippets]);

  const current = snippets[currentSnippet % snippets.length];

  const advanceSnippet = useCallback(() => {
    setCurrentSnippet((prev) => (prev + 1) % snippets.length);
    setColoredLines(new Set());
    setScanKey((k) => k + 1);
  }, [snippets.length]);

  useEffect(() => {
    const lineCount = current.lines.length;
    const sweepDuration = 2200;
    const lineInterval = sweepDuration / (lineCount + 1);

    const timers = current.lines.map((_, i) =>
      setTimeout(() => {
        setColoredLines((prev) => {
          const next = new Set(Array.from(prev));
          next.add(i);
          return next;
        });
      }, lineInterval * (i + 1))
    );

    snippetTimerRef.current = setTimeout(advanceSnippet, 2800);

    return () => {
      timers.forEach(clearTimeout);
      if (snippetTimerRef.current) clearTimeout(snippetTimerRef.current);
    };
  }, [currentSnippet, current.lines, advanceSnippet]);

  useEffect(() => {
    const commitInterval = setInterval(() => {
      setScannedCommits((prev) => Math.min(prev + 1, safeCommits));
    }, 280);

    return () => clearInterval(commitInterval);
  }, [safeCommits]);

  useEffect(() => {
    if (lineTarget <= 0) {
      setEvaluatedLines(0);
      return;
    }
    const duration = 2600;
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      setEvaluatedLines(Math.floor(lineTarget * eased));
      if (t >= 1) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [lineTarget]);

  useEffect(() => {
    const targets = contributorImpactTiers;
    const duration = 2200;
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const ease = 1 - (1 - t) * (1 - t);
      setImpactCounts({
        high: Math.round(targets.high * ease),
        medium: Math.round(targets.medium * ease),
        low: Math.round(targets.low * ease),
      });
      if (t >= 1) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [contributorImpactTiers]);

  const maxTier = Math.max(
    1,
    impactCounts.high,
    impactCounts.medium,
    impactCounts.low
  );

  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden animate-fade-slide-in">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-orange pulse-glow-orange" />
          <span className="text-[12px] font-semibold text-text-primary">
            Code scan (repo diffs)
          </span>
        </div>
        <span className="text-[11px] font-mono text-text-tertiary">
          {Math.min(scannedCommits, safeCommits)}/{safeCommits} commits in sample
        </span>
      </div>

      <div className="flex">
        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-3 min-w-0">
            <span className="text-[11px] font-mono text-accent-teal truncate">
              {current.file}
            </span>
            <span className="text-[10px] text-text-tertiary shrink-0">
              · {current.author}
            </span>
          </div>

          <div className="relative bg-bg-primary rounded-md p-4 font-mono text-[12px] leading-[22px] overflow-hidden">
            <div
              key={scanKey}
              className="scan-line"
              style={{
                animation: "scanDown 2.2s ease-in-out forwards",
              }}
            />

            {current.lines.map((line, i) => {
              const isColored = coloredLines.has(i);
              return (
                <div
                  key={`${currentSnippet}-${i}`}
                  className="transition-colors duration-500 whitespace-pre-wrap break-all"
                  style={{
                    color: isColored
                      ? IMPACT_COLORS[line.impact]
                      : "#3A3F52",
                    textShadow:
                      isColored && line.impact === "high"
                        ? `0 0 8px ${IMPACT_COLORS.high}40`
                        : "none",
                  }}
                >
                  {line.text || "\u00A0"}
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-[11px] text-text-tertiary">
            Repository activity: {Math.min(scannedCommits, safeCommits)}/
            {safeCommits} commits · {formatNumberEnUS(evaluatedLines)} line changes
            (add+del) in invoice
          </div>
        </div>

        <div className="w-[180px] border-l border-border p-4 space-y-4 shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-text-tertiary">
            Contributors by tier
          </p>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-[0.5px] text-accent-teal">
                HIGH
              </span>
              <span className="text-[11px] font-mono text-text-secondary">
                {impactCounts.high}
              </span>
            </div>
            <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-teal transition-all duration-300"
                style={{
                  width: `${(impactCounts.high / maxTier) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-[0.5px] text-accent-orange">
                MEDIUM
              </span>
              <span className="text-[11px] font-mono text-text-secondary">
                {impactCounts.medium}
              </span>
            </div>
            <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-orange transition-all duration-300"
                style={{
                  width: `${(impactCounts.medium / maxTier) * 100}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-[0.5px] text-text-tertiary">
                LOW
              </span>
              <span className="text-[11px] font-mono text-text-secondary">
                {impactCounts.low}
              </span>
            </div>
            <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-text-tertiary transition-all duration-300"
                style={{
                  width: `${(impactCounts.low / maxTier) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
