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

export interface AISplit {
  name: string;
  percentage: number;
  justification: string;
  keyContributions: string[];
}

export interface AIInvoiceItem {
  contributor: string;
  description: string;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  topFiles: string[];
  amount: number;
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
}
