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
  category: "feature_gap" | "churn_driver" | "product_strength" | "pricing_concern";
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
  status: "uploading" | "parsing" | "analyzing" | "complete" | "error";
  errorMsg?: string | null;
  reviewCount?: number;
}

export type AnalysisStatus = "idle" | "uploading" | "parsing" | "analyzing" | "complete" | "error";

export const CATEGORY_LABELS: Record<string, string> = {
  feature_gap: "Feature Gap",
  churn_driver: "Churn Driver",
  product_strength: "Product Strength",
  pricing_concern: "Pricing Concern",
};

export const CONFIDENCE_LABEL = (score: number, quoteCount: number): string => {
  if (quoteCount >= 5) return `High Confidence — ${quoteCount} reviews`;
  if (quoteCount >= 2) return `Medium Confidence — ${quoteCount} reviews`;
  return `Low Confidence — ${quoteCount} review${quoteCount !== 1 ? "s" : ""}`;
};

export const CONFIDENCE_VARIANT = (quoteCount: number): "default" | "secondary" | "destructive" => {
  if (quoteCount >= 5) return "default";
  if (quoteCount >= 2) return "secondary";
  return "destructive";
};
