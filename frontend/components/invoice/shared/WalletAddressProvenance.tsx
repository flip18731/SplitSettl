"use client";

import type { AISplit } from "@/lib/ai";
import { walletAddressSourceDescription } from "@/lib/ai";

type Props = {
  split: Pick<
    AISplit,
    "walletAddressSource" | "walletAddressCommitEvidence"
  >;
  /** `owner/repo` for GitHub commit link */
  repoSlug: string;
  /** Tighter box for table / form rows */
  compact?: boolean;
};

export default function WalletAddressProvenance({
  split,
  repoSlug,
  compact,
}: Props) {
  const ev = split.walletAddressCommitEvidence;
  if (ev?.fullMessage) {
    const commitUrl = `https://github.com/${repoSlug}/commit/${ev.sha}`;
    return (
      <div className={compact ? "mt-1 space-y-0.5" : "mt-1.5 space-y-1"}>
        <p className="text-[9px] font-semibold uppercase tracking-wide text-text-tertiary">
          ETH-Adresse aus dieser Commit-Message ·{" "}
          <a
            href={commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono normal-case text-accent-teal hover:underline"
          >
            {ev.sha}
          </a>
        </p>
        <pre
          className={`text-[10px] font-mono text-text-secondary bg-bg-elevated/90 border border-border rounded-md p-2 overflow-x-auto whitespace-pre-wrap break-words leading-snug ${
            compact ? "max-h-36" : "max-h-52"
          } overflow-y-auto`}
        >
          {ev.fullMessage}
        </pre>
      </div>
    );
  }

  const hint = walletAddressSourceDescription(split.walletAddressSource);
  if (hint) {
    return (
      <p className="text-[9px] text-text-tertiary/90 mt-0.5 leading-snug pl-2.5">
        {hint}
      </p>
    );
  }

  if (split.walletAddressSource === "commit-message") {
    return (
      <p className="text-[9px] text-text-tertiary/90 mt-0.5 leading-snug pl-2.5">
        Aus einer Commit-Message in der GitHub-Historie (Text nicht verfügbar).
      </p>
    );
  }

  return null;
}
