"use client";

import type { KeyEvidence } from "@/lib/ai";

interface Props {
  evidence: KeyEvidence;
  repoSlug: string;
}

export default function EvidenceLink({ evidence, repoSlug }: Props) {
  return (
    <a
      href={`https://github.com/${repoSlug}/commit/${evidence.sha}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[10px] font-mono text-text-secondary hover:text-accent-teal transition-colors"
    >
      <span className="text-text-tertiary">{evidence.sha}</span>
      <span className="truncate max-w-[200px]">
        &quot;{evidence.message}&quot;
      </span>
      <span className="text-text-tertiary">(+{evidence.additions})</span>
    </a>
  );
}
