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

export interface AISplit {
  name: string;
  percentage: number;
  justification: string;
  keyContributions: string[];
  impactRating: "HIGH" | "MEDIUM" | "LOW";
  impactScores: ImpactScores;
  keyEvidence: KeyEvidence[];
  walletAddress?: string; // from .splitsettle.json in the repo
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
}
