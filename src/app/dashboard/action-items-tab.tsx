"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquareQuote,
  ChevronDown,
  ChevronUp,
  Copy,
  Star,
  Search,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import type { ActionItem, SourceQuote } from "@/lib/data";
import { CATEGORY_LABELS, CONFIDENCE_LABEL, CONFIDENCE_VARIANT } from "@/lib/data";

type Priority = ActionItem["priority"];
type Status = ActionItem["status"];

const priorityVariant: Record<Priority, "destructive" | "default" | "secondary"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

const statusConfig: Record<Status, { label: string; icon: React.ReactNode }> = {
  not_started: {
    label: "To Do",
    icon: <Clock className="h-4 w-4 text-muted-foreground" />,
  },
  in_progress: {
    label: "In Progress",
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  },
  complete: {
    label: "Done",
    icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  },
};

function SourceQuoteCard({ quote }: { quote: SourceQuote }) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1.5">
      <p className="text-sm italic text-foreground/90">
        &ldquo;{quote.quoteText}&rdquo;
      </p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {quote.rating}/5
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
          {quote.platform}
        </span>
        <span>{quote.reviewDate}</span>
        <span>{quote.productName}</span>
        {quote.reviewerRole && (
          <span className="text-muted-foreground/70">{quote.reviewerRole}</span>
        )}
      </div>
    </div>
  );
}

function ActionItemCard({ item }: { item: ActionItem }) {
  const { updateActionItemStatus } = useAppStore();
  const [showSources, setShowSources] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    await updateActionItemStatus(item.id, newStatus);
    setUpdating(false);
  };

  const handleCopy = () => {
    const text = `${item.title}\n\n${item.description}\n\nConfidence: ${CONFIDENCE_LABEL(item.confidenceScore, item.sourceQuotes.length)}\nSources: ${item.sourceQuotes.length} review${item.sourceQuotes.length !== 1 ? "s" : ""}`;
    navigator.clipboard.writeText(text);
  };

  // Filter source quotes
  const filteredQuotes = useMemo(() => {
    return item.sourceQuotes.filter((sq) => {
      const matchesSearch =
        !searchQuery ||
        sq.quoteText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sq.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform =
        platformFilter === "all" || sq.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [item.sourceQuotes, searchQuery, platformFilter]);

  const platforms = useMemo(() => {
    return [...new Set(item.sourceQuotes.map((sq) => sq.platform))];
  }, [item.sourceQuotes]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={priorityVariant[item.priority]}>{item.priority}</Badge>
          {item.insightCategory && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.insightCategory === "feature_gap"
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-950/30"
                  : item.insightCategory === "churn_driver"
                    ? "text-red-600 bg-red-50 dark:bg-red-950/30"
                    : item.insightCategory === "product_strength"
                      ? "text-green-600 bg-green-50 dark:bg-green-950/30"
                      : "text-amber-600 bg-amber-50 dark:bg-amber-950/30"
                }`}
            >
              {CATEGORY_LABELS[item.insightCategory] ?? item.insightCategory}
            </span>
          )}
          <Badge variant={CONFIDENCE_VARIANT(item.sourceQuotes.length)} className="ml-auto text-xs">
            {CONFIDENCE_LABEL(item.confidenceScore, item.sourceQuotes.length)}
          </Badge>
        </div>
        <CardTitle className="text-base leading-snug pt-1">
          {item.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm leading-relaxed text-foreground/90">
          {item.description}
        </p>

        {/* Insight context */}
        {item.insightTitle && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <MessageSquareQuote className="h-3.5 w-3.5" />
              Based on Insight
            </div>
            <p className="text-sm font-medium">{item.insightTitle}</p>
            {item.insightDescription && (
              <p className="text-xs text-muted-foreground">
                {item.insightDescription}
              </p>
            )}
          </div>
        )}

        {/* Source Quotes Toggle */}
        {item.sourceQuotes.length > 0 && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
              onClick={() => setShowSources(!showSources)}
            >
              <span className="flex items-center gap-2 text-xs">
                <MessageSquareQuote className="h-3.5 w-3.5" />
                View Sources ({item.sourceQuotes.length} reviews)
              </span>
              {showSources ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            <AnimatePresence>
              {showSources && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-3">
                    {/* Filters */}
                    {item.sourceQuotes.length > 2 && (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search quotes..."
                            className="h-8 pl-8 text-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <select
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          value={platformFilter}
                          onChange={(e) => setPlatformFilter(e.target.value)}
                        >
                          <option value="all">All Platforms</option>
                          {platforms.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quote cards */}
                    {filteredQuotes.map((quote, i) => (
                      <SourceQuoteCard key={`${quote.id}-${i}`} quote={quote} />
                    ))}
                    {filteredQuotes.length === 0 && (
                      <p className="text-center text-xs text-muted-foreground py-2">
                        No matching quotes.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {statusConfig[item.status].icon}
              <span>{statusConfig[item.status].label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              title="Copy insight to clipboard"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            {item.status !== "complete" && (
              <Button
                variant="outline"
                size="sm"
                disabled={updating}
                onClick={() =>
                  handleStatusUpdate(
                    item.status === "not_started" ? "in_progress" : "complete"
                  )
                }
              >
                {updating && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {item.status === "not_started" ? "Start" : "Mark Complete"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionItemsTab() {
  const { actionItems } = useAppStore();

  const todo = actionItems.filter((i) => i.status === "not_started").length;
  const inProgress = actionItems.filter((i) => i.status === "in_progress").length;
  const done = actionItems.filter((i) => i.status === "complete").length;

  if (actionItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No action items yet. Upload and analyze reviews to generate action items.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>To Do</CardDescription>
            <CardTitle className="text-3xl">{todo}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl">{inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{done}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        {actionItems.map((item) => (
          <ActionItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
