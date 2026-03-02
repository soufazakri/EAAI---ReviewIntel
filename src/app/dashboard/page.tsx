"use client";

import { useMemo, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitorsTab } from "./competitors-tab";
import { ActionItemsTab } from "./action-items-tab";
import { useAppStore } from "@/lib/store";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload,
  FileDown,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  CATEGORY_LABELS,
  CONFIDENCE_LABEL,
  isLowEvidence,
} from "@/lib/data";

const PIPELINE_STEPS = [
  { key: "extracting", label: "Extracting claims from reviews" },
  { key: "clustering", label: "Clustering related claims" },
  { key: "synthesizing", label: "Synthesizing insights" },
  { key: "generating_battlecards", label: "Generating action items" },
] as const;

const PIPELINE_KEYS = PIPELINE_STEPS.map((s) => s.key);

export default function DashboardPage() {
  const {
    datasetId,
    competitors,
    insights,
    actionItems,
    reviewCount,
    loading,
    error,
    analysisStatus,
    isReady,
    exportToPDF,
    exportToCSV,
    uploadMoreReviews,
    triggerAnalysis,
  } = useAppStore();

  const [showUploadMore, setShowUploadMore] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isReady) return null;

  const hasData = analysisStatus === "complete" && (competitors.length > 0 || insights.length > 0);
  const isAnalyzing = [
    "uploading", "parsing", "extracting", "clustering",
    "synthesizing", "generating_battlecards",
  ].includes(analysisStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            {hasData
              ? `Tracking ${competitors.length} competitor${competitors.length !== 1 ? "s" : ""} across ${reviewCount} reviews.`
              : isAnalyzing
                ? "Analyzing your reviews..."
                : "Upload review data to start tracking competitors."}
          </p>
        </div>
        {hasData && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowUploadMore(true)}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload More Reviews
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileDown className="mr-1.5 h-3.5 w-3.5" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
              CSV
            </Button>
          </div>
        )}
      </div>

      {/* Analysis Progress Indicator */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center rounded-xl border py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-6" />
          <div className="space-y-3 w-full max-w-sm">
            {PIPELINE_STEPS.map((s) => {
              const currentIdx = PIPELINE_KEYS.indexOf(analysisStatus as typeof PIPELINE_KEYS[number]);
              const stepIdx = PIPELINE_KEYS.indexOf(s.key);
              const isDone = currentIdx >= 0 && stepIdx < currentIdx;
              const isCurrent = stepIdx === currentIdx;

              return (
                <div key={s.key} className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20 shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-sm text-left",
                      isDone ? "text-foreground" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            This may take 1-3 minutes depending on the dataset size.
          </p>
        </div>
      )}

      {/* Error State */}
      {analysisStatus === "error" && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20 py-12 text-center space-y-4">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-lg font-medium">Analysis Failed</p>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          {datasetId && (
            <Button onClick={() => triggerAnalysis(datasetId)} disabled={loading}>
              {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Retry Analysis
            </Button>
          )}
        </div>
      )}

      {hasData && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Reviews Analyzed</CardDescription>
                <CardTitle className="text-3xl">{reviewCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Competitors</CardDescription>
                <CardTitle className="text-3xl">{competitors.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Key Insights</CardDescription>
                <CardTitle className="text-3xl">{insights.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Action Items</CardDescription>
                <CardTitle className="text-3xl">{actionItems.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="competitors" className="space-y-4">
            <TabsList>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="actions">
                Action Items
                {actionItems.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium">
                    {actionItems.filter((a) => a.status !== "complete").length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="competitors">
              <CompetitorsTab />
            </TabsContent>

            <TabsContent value="actions">
              <ActionItemsTab />
            </TabsContent>

            <TabsContent value="insights">
              <InsightsOverview />
            </TabsContent>
          </Tabs>
        </>
      )}

      {!hasData && !isAnalyzing && analysisStatus !== "error" && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No data yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a CSV file with competitor reviews to get started.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            Upload Reviews
          </Link>
        </div>
      )}

      {/* Upload More Reviews Dialog */}
      {showUploadMore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-xl border bg-card p-6 shadow-lg max-w-md space-y-4">
            <h3 className="text-lg font-semibold">Upload More Reviews</h3>
            <p className="text-sm text-muted-foreground">
              This will add new reviews to your existing dataset and re-run the
              full analysis. Previous insights will be regenerated. Continue?
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setShowUploadMore(false);
                  await uploadMoreReviews(file);
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowUploadMore(false)}>
                Cancel
              </Button>
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose CSV File
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InsightsOverview() {
  const { insights } = useAppStore();

  // Sort: low-evidence to bottom, then by confidence descending
  const sortedInsights = useMemo(() => {
    return [...insights].sort((a, b) => {
      const aLow = isLowEvidence(a.confidenceScore, a.sourceQuotes.length, a.category);
      const bLow = isLowEvidence(b.confidenceScore, b.sourceQuotes.length, b.category);
      if (aLow && !bLow) return 1;
      if (!aLow && bLow) return -1;
      return b.confidenceScore - a.confidenceScore;
    });
  }, [insights]);

  return (
    <div className="space-y-4">
      {sortedInsights.map((insight) => {
        const lowEvidence = isLowEvidence(insight.confidenceScore, insight.sourceQuotes.length, insight.category);
        const baseCategory = insight.category.replace("_low_evidence", "");

        return (
          <Card key={insight.id}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${baseCategory === "feature_gap"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                    : baseCategory === "churn_driver"
                      ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                      : baseCategory === "product_strength"
                        ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                    }`}
                >
                  {CATEGORY_LABELS[insight.category] ?? CATEGORY_LABELS[baseCategory] ?? insight.category}
                </span>
                {lowEvidence && (
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200">
                    Low Evidence
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {CONFIDENCE_LABEL(insight.confidenceScore, insight.sourceQuotes.length)}
                </span>
              </div>
              <CardTitle className="text-base">{insight.title}</CardTitle>
              <CardDescription>{insight.description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
      {insights.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No insights generated yet.
        </p>
      )}
    </div>
  );
}
