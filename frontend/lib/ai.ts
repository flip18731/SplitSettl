// Types for the GitHub-based AI analysis

export interface CommitTimelineEntry {
  date: string;
  sha: string;
  message: string;
  additions: number;
  deletions: number;
  author: string;
}

export interface ContributorVizData {
  name: string;
  commits: number;
  additions: number;
  deletions: number;
  filesChanged: number;
  languages: string[];
  commitTimeline: CommitTimelineEntry[];
  dailyActivity: Record<string, number>;
  fileTypeBreakdown: Record<string, number>;
}

export interface VisualizationData {
  contributors: ContributorVizData[];
  allCommits: CommitTimelineEntry[];
}

export interface ImpactScores {
  complexity: number;
  featureImpact: number;
  scopeBreadth: number;
  consistency: number;
  volume: number;
}

export interface KeyEvidence {
  sha: string;
  message: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  additions: number;
}

export interface CodePatch {
  file: string;
  author: string;
  code: string;
}

/** Where SplitSettl took the payout address from (set by /api/ai/analyze). */
export type WalletAddressSource = "splitsettle" | "commit-message";

/** Commit body where an embedded 0x address was found (commit-message source). */
export interface WalletAddressCommitEvidence {
  /** Short SHA from analysis (matches GitHub short ref) */
  sha: string;
  /** Full commit message text as on GitHub (incl. body) */
  fullMessage: string;
}

export interface AISplit {
  name: string;
  percentage: number;
  justification: string;
  keyContributions: string[];
  impactRating: "HIGH" | "MEDIUM" | "LOW";
  impactScores: ImpactScores;
  keyEvidence: KeyEvidence[];
  walletAddress?: string;
  /** Set when wallet was resolved during analysis */
  walletAddressSource?: WalletAddressSource;
  /** Exact commit message when source is commit-message */
  walletAddressCommitEvidence?: WalletAddressCommitEvidence;
}

/** Short German label when we do not show structured evidence (e.g. .splitsettle.json). */
export function walletAddressSourceDescription(
  source?: WalletAddressSource
): string | null {
  switch (source) {
    case "splitsettle":
      return "Aus `.splitsettle.json` im Repository";
    case "commit-message":
      return null;
    default:
      return null;
  }
}

export interface AIInvoiceItem {
  contributor: string;
  description: string;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  topFiles: string[];
  amount: number;
  impactRating: "HIGH" | "MEDIUM" | "LOW";
}

export interface AIInvoice {
  id: string;
  project: string;
  generatedAt: string;
  items: AIInvoiceItem[];
  total: number;
  currency: string;
}

/** Real HashKey Merchant (HSP) checkout session when order creation succeeds. */
export interface HspCheckoutSession {
  /** Cart / invoice id (cart mandate id or local invoice id fallback). */
  cartMandateId: string;
  paymentRequestId: string;
  paymentUrl: string | null;
  flowId: string | null;
  /** Raw gateway JSON (debug / future UI) */
  raw?: unknown;
}

export interface AIAnalysisResult {
  repository: string;
  branch: string;
  commitsAnalyzed: number;
  splits: AISplit[];
  invoice: AIInvoice;
  visualizationData: VisualizationData;
  aiSummary: string;
  codeSnippets: CodePatch[];
  hasAddressConfig?: boolean; // true if .splitsettle.json was found in the repo
  /** Set by /api/ai/analyze: which LLM ran, or GitHub-only fallback */
  analysisSource?: "openai" | "anthropic" | "fallback";
  /** If an LLM was expected but failed (HTTP/parse); optional debug hint */
  analysisError?: string;
  /** Optional — populated by `/api/hsp/create-order` on the client, not by analyze. */
  hsp?: HspCheckoutSession | null;
  /** Non-fatal error string if HSP order could not be created */
  hspError?: string;
}
