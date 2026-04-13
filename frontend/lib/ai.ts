export interface AIContributionInput {
  projectName: string;
  contributionData: string;
}

export interface AISplit {
  contributor: string;
  address: string;
  percentage: number;
  justification: string;
}

export interface AIInvoiceItem {
  description: string;
  contributor: string;
  address: string;
  hours: number;
  rate: number;
  amount: number;
}

export interface AIInvoice {
  id: string;
  date: string;
  projectName: string;
  items: AIInvoiceItem[];
  total: number;
  currency: string;
}

export interface AIAnalysisResult {
  splits: AISplit[];
  invoice: AIInvoice;
  summary: string;
}

export async function analyzeContributions(
  input: AIContributionInput
): Promise<AIAnalysisResult> {
  const response = await fetch("/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze contributions");
  }

  return response.json();
}
