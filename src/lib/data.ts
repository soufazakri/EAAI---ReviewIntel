/**
 * TypeScript interfaces for ReviewIntel data structures.
 * All data comes from the API — no hardcoded values.
 */

export interface SourceQuote {
  id: string;
  quoteText: string;
  claimText: string;
  reviewDate: string;
  platform: string;
  rating: number;
  reviewerName: string;
  reviewerRole: string;
  productName: string;
  reviewUrl?: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: "high" | "medium" | "low";
  confidenceScore: number;
  sourceQuotes: SourceQuote[];
}

export interface Competitor {
  id: string;
  name: string;
  mentionCount: number;
  avgSentiment: number;
  complaintThemes: string[];
  praiseThemes: string[];
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "not_started" | "in_progress" | "complete";
  insightTitle: string | null;
  insightDescription: string | null;
  insightCategory: string | null;
  confidenceScore: number;
  sourceQuotes: SourceQuote[];
}

export interface DatasetInfo {
  id: string;
  name: string;
  status: "uploading" | "parsing" | "extracting" | "clustering" | "synthesizing" | "generating_battlecards" | "complete" | "error";
  errorMsg?: string | null;
  reviewCount?: number;
}

export type AnalysisStatus =
  | "idle"
  | "uploading"
  | "parsing"
  | "extracting"
  | "clustering"
  | "synthesizing"
  | "generating_battlecards"
  | "complete"
  | "error";

export const CATEGORY_LABELS: Record<string, string> = {
  feature_gap: "Feature Gap",
  churn_driver: "Churn Driver",
  product_strength: "Product Strength",
  pricing_concern: "Pricing Concern",
  feature_gap_low_evidence: "Feature Gap",
  churn_driver_low_evidence: "Churn Driver",
  product_strength_low_evidence: "Product Strength",
  pricing_concern_low_evidence: "Pricing Concern",
};

export const isLowEvidence = (score: number, quoteCount: number, category?: string): boolean => {
  return (quoteCount <= 1 && score <= 0.4) || (category?.includes("_low_evidence") ?? false);
};

export const CONFIDENCE_LABEL = (score: number, quoteCount: number): string => {
  if (quoteCount <= 1 && score <= 0.4) return `Low Evidence — ${quoteCount} source${quoteCount !== 1 ? "s" : ""}`;
  if (quoteCount >= 5) return `High Confidence — ${quoteCount} reviews`;
  if (quoteCount >= 2) return `Medium Confidence — ${quoteCount} reviews`;
  return `Low Confidence — ${quoteCount} review${quoteCount !== 1 ? "s" : ""}`;
};

export const CONFIDENCE_VARIANT = (quoteCount: number, score?: number): "default" | "secondary" | "destructive" | "outline" => {
  if (quoteCount <= 1 && (score ?? 1) <= 0.4) return "outline";
  if (quoteCount >= 5) return "default";
  if (quoteCount >= 2) return "secondary";
  return "destructive";
};
