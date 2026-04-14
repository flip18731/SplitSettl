"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CodeLine {
  text: string;
  impact: "high" | "medium" | "low";
}

interface Snippet {
  file: string;
  author: string;
  lines: CodeLine[];
}

const DEFAULT_SNIPPETS: Snippet[] = [
  {
    file: "src/_streaming.py",
    author: "Robert Craigie",
    lines: [
      { text: "class AsyncStream:", impact: "high" },
      { text: "    async def __aiter__(self):", impact: "high" },
      { text: "        async for chunk in self._stream:", impact: "high" },
      { text: '            if chunk.type == "content_block_delta":', impact: "medium" },
      { text: "                yield chunk.delta", impact: "medium" },
      { text: "", impact: "low" },
      { text: "    async def close(self):", impact: "medium" },
      { text: "        await self._stream.close()", impact: "low" },
    ],
  },
  {
    file: "src/_client.py",
    author: "Robert Craigie",
    lines: [
      { text: "def _make_request(self, method, path, **kwargs):", impact: "high" },
      { text: "    headers = self._build_headers()", impact: "medium" },
      { text: "    response = self._session.request(", impact: "high" },
      { text: '        method, f"{self.base_url}{path}",', impact: "medium" },
      { text: "        headers=headers, timeout=self._timeout,", impact: "low" },
      { text: "    )", impact: "low" },
      { text: "    return self._parse_response(response)", impact: "high" },
    ],
  },
  {
    file: "tests/test_streaming.py",
    author: "Deven Mital",
    lines: [
      { text: "@pytest.mark.asyncio", impact: "low" },
      { text: "async def test_streaming_message():", impact: "medium" },
      { text: "    stream = await client.messages.create(", impact: "medium" },
      { text: '        model="claude-sonnet-4-20250514",', impact: "low" },
      { text: "        max_tokens=100, stream=True,", impact: "low" },
      { text: "    )", impact: "low" },
      { text: "    chunks = [c async for c in stream]", impact: "medium" },
      { text: "    assert len(chunks) > 0", impact: "medium" },
    ],
  },
  {
    file: "src/types/__init__.py",
    author: "Stainless Bot",
    lines: [
      { text: "from .message import Message, MessageParam", impact: "medium" },
      { text: "from .completion import Completion", impact: "medium" },
      { text: "from .content_block import ContentBlock", impact: "medium" },
      { text: "from .tool_use_block import ToolUseBlock", impact: "high" },
      { text: "", impact: "low" },
      { text: '__all__ = ["Message", "Completion",', impact: "low" },
      { text: '    "ContentBlock", "ToolUseBlock"]', impact: "low" },
    ],
  },
];

const IMPACT_COLORS = {
  high: "#2DD4A8",
  medium: "#F59E42",
  low: "#5A6275",
};

interface Props {
  commitsTotal: number;
}

export default function CodeScanAnimation({ commitsTotal }: Props) {
  const [currentSnippet, setCurrentSnippet] = useState(0);
  const [coloredLines, setColoredLines] = useState<Set<number>>(new Set());
  const [scanKey, setScanKey] = useState(0);
  const [scannedCommits, setScannedCommits] = useState(0);
  const [evaluatedLines, setEvaluatedLines] = useState(0);
  const [impactCounts, setImpactCounts] = useState({ high: 0, medium: 0, low: 0 });
  const snippetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const snippets = DEFAULT_SNIPPETS;
  const current = snippets[currentSnippet];

  // Cycle through snippets
  const advanceSnippet = useCallback(() => {
    setCurrentSnippet((prev) => (prev + 1) % snippets.length);
    setColoredLines(new Set());
    setScanKey((k) => k + 1);
  }, [snippets.length]);

  // Color lines progressively as scan sweeps
  useEffect(() => {
    const lineCount = current.lines.length;
    const sweepDuration = 2200;
    const lineInterval = sweepDuration / (lineCount + 1);

    const timers = current.lines.map((_, i) =>
      setTimeout(() => {
        setColoredLines((prev) => { const next = new Set(Array.from(prev)); next.add(i); return next; });
      }, lineInterval * (i + 1))
    );

    snippetTimerRef.current = setTimeout(advanceSnippet, 2800);

    return () => {
      timers.forEach(clearTimeout);
      if (snippetTimerRef.current) clearTimeout(snippetTimerRef.current);
    };
  }, [currentSnippet, current.lines, advanceSnippet]);

  // Progress counters
  useEffect(() => {
    const commitInterval = setInterval(() => {
      setScannedCommits((prev) => Math.min(prev + 1, commitsTotal));
    }, 300);

    const lineInterval = setInterval(() => {
      setEvaluatedLines((prev) => prev + Math.floor(Math.random() * 180 + 80));
    }, 250);

    const impactInterval = setInterval(() => {
      setImpactCounts((prev) => ({
        high: Math.min(prev.high + (Math.random() > 0.5 ? 1 : 0), Math.ceil(commitsTotal * 0.35)),
        medium: Math.min(prev.medium + (Math.random() > 0.4 ? 1 : 0), Math.ceil(commitsTotal * 0.35)),
        low: Math.min(prev.low + (Math.random() > 0.6 ? 1 : 0), Math.ceil(commitsTotal * 0.3)),
      }));
    }, 600);

    return () => {
      clearInterval(commitInterval);
      clearInterval(lineInterval);
      clearInterval(impactInterval);
    };
  }, [commitsTotal]);

  const maxImpact = Math.ceil(commitsTotal * 0.35);

  return (
    <div className="bg-bg-surface border border-border rounded-lg overflow-hidden animate-fade-slide-in">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-orange pulse-glow-orange" />
          <span className="text-[12px] font-semibold text-text-primary">
            AI Code Analysis
          </span>
        </div>
        <span className="text-[11px] font-mono text-text-tertiary">
          {scannedCommits}/{commitsTotal} commits scanned
        </span>
      </div>

      <div className="flex">
        {/* Code display */}
        <div className="flex-1 p-4">
          {/* File info */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-mono text-accent-teal">
              {current.file}
            </span>
            <span className="text-[10px] text-text-tertiary">
              by {current.author}
            </span>
          </div>

          {/* Code block with scan line */}
          <div className="relative bg-bg-primary rounded-md p-4 font-mono text-[12px] leading-[22px] overflow-hidden">
            {/* Scan line */}
            <div
              key={scanKey}
              className="scan-line"
              style={{
                animation: "scanDown 2.2s ease-in-out forwards",
              }}
            />

            {/* Code lines */}
            {current.lines.map((line, i) => {
              const isColored = coloredLines.has(i);
              return (
                <div
                  key={`${currentSnippet}-${i}`}
                  className="transition-colors duration-500 whitespace-pre"
                  style={{
                    color: isColored
                      ? IMPACT_COLORS[line.impact]
                      : "#3A3F52",
                    textShadow: isColored && line.impact === "high"
                      ? `0 0 8px ${IMPACT_COLORS.high}40`
                      : "none",
                  }}
                >
                  {line.text || "\u00A0"}
                </div>
              );
            })}
          </div>

          {/* Counter */}
          <div className="mt-3 text-[11px] text-text-tertiary">
            Analyzing: {scannedCommits}/{commitsTotal} commits &middot;{" "}
            {evaluatedLines.toLocaleString()} lines evaluated
          </div>
        </div>

        {/* Impact category sidebar */}
        <div className="w-[180px] border-l border-border p-4 space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[1px] text-text-tertiary">
            Impact Detection
          </p>

          {/* HIGH */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-[0.5px] text-accent-teal">
                HIGH IMPACT
              </span>
              <span className="text-[11px] font-mono text-text-secondary">
                {impactCounts.high}
              </span>
            </div>
            <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-teal transition-all duration-300"
                style={{ width: `${(impactCounts.high / maxImpact) * 100}%` }}
              />
            </div>
          </div>

          {/* MEDIUM */}
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
                  width: `${(impactCounts.medium / maxImpact) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* LOW */}
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
                style={{ width: `${(impactCounts.low / maxImpact) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
