"use client";

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
import { Loader2, Upload, FileDown, FileSpreadsheet } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const {
    competitors,
    insights,
    actionItems,
    reviewCount,
    loading,
    analysisStatus,
    isReady,
    exportToPDF,
    exportToCSV,
  } = useAppStore();

  if (!isReady) return null;

  const hasData = analysisStatus === "complete" && (competitors.length > 0 || insights.length > 0);
  const isAnalyzing = analysisStatus === "analyzing" || analysisStatus === "parsing" || analysisStatus === "uploading";

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

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center rounded-xl border py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">
            {analysisStatus === "uploading"
              ? "Uploading..."
              : analysisStatus === "parsing"
                ? "Parsing reviews..."
                : "Running AI analysis..."}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This may take 1-3 minutes depending on the dataset size.
          </p>
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

      {!hasData && !isAnalyzing && !loading && (
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
    </div>
  );
}

function InsightsOverview() {
  const { insights } = useAppStore();
  const { CATEGORY_LABELS, CONFIDENCE_LABEL, CONFIDENCE_VARIANT } = require("@/lib/data");

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card key={insight.id}>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${insight.category === "feature_gap"
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                    : insight.category === "churn_driver"
                      ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                      : insight.category === "product_strength"
                        ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                  }`}
              >
                {CATEGORY_LABELS[insight.category] ?? insight.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {CONFIDENCE_LABEL(insight.confidenceScore, insight.sourceQuotes.length)}
              </span>
            </div>
            <CardTitle className="text-base">{insight.title}</CardTitle>
            <CardDescription>{insight.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
      {insights.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No insights generated yet.
        </p>
      )}
    </div>
  );
}
