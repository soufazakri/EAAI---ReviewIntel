"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquareQuote,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import type { Competitor } from "@/lib/data";

function SentimentBadge({ sentiment }: { sentiment: number }) {
  if (sentiment > 0.3)
    return <Badge variant="default">Positive</Badge>;
  if (sentiment < -0.3)
    return <Badge variant="destructive">Negative</Badge>;
  return <Badge variant="secondary">Mixed</Badge>;
}

function CompetitorRow({ competitor }: { competitor: Competitor }) {
  const [expanded, setExpanded] = useState(false);
  const { insights } = useAppStore();

  // Find insights related to this competitor
  const relatedInsights = insights.filter(
    (ins) =>
      ins.sourceQuotes.some(
        (sq) => sq.productName.toLowerCase() === competitor.name.toLowerCase()
      )
  );

  // Collect all source quotes for this competitor
  const competitorQuotes = relatedInsights.flatMap((ins) =>
    ins.sourceQuotes
      .filter(
        (sq) => sq.productName.toLowerCase() === competitor.name.toLowerCase()
      )
      .map((sq) => ({
        ...sq,
        insightTitle: ins.title,
      }))
  );

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-accent/50"
        onClick={() => setExpanded(!expanded)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {competitor.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{competitor.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <span className="tabular-nums">{competitor.mentionCount}</span>
        </TableCell>
        <TableCell>
          <SentimentBadge sentiment={competitor.avgSentiment} />
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {competitor.praiseThemes.slice(0, 2).map((theme) => (
              <span
                key={theme}
                className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400"
              >
                {theme}
              </span>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {competitor.complaintThemes.slice(0, 2).map((theme) => (
              <span
                key={theme}
                className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400"
              >
                {theme}
              </span>
            ))}
          </div>
        </TableCell>
        <TableCell>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
      </TableRow>

      {/* Expanded Source Quotes */}
      <AnimatePresence>
        {expanded && (
          <TableRow>
            <TableCell colSpan={6} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <MessageSquareQuote className="h-3.5 w-3.5" />
                    Source Reviews ({competitorQuotes.length})
                  </div>

                  {competitorQuotes.length > 0 ? (
                    <div className="space-y-2">
                      {competitorQuotes.slice(0, 5).map((quote, i) => (
                        <div
                          key={`${quote.id}-${i}`}
                          className="rounded-lg border bg-card p-3 space-y-1"
                        >
                          <p className="text-sm italic text-foreground/90">
                            &ldquo;{quote.quoteText}&rdquo;
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {quote.rating}/5
                            </span>
                            <span>{quote.platform}</span>
                            <span>{quote.reviewDate}</span>
                            <span>{quote.reviewerName}</span>
                          </div>
                        </div>
                      ))}
                      {competitorQuotes.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{competitorQuotes.length - 5} more reviews
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No individual review quotes available for this competitor.
                    </p>
                  )}
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  );
}

export function CompetitorsTab() {
  const { competitors } = useAppStore();

  if (competitors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No competitors found. Upload reviews to identify competitors.
      </div>
    );
  }

  const avgSentiment =
    competitors.reduce((s, c) => s + c.avgSentiment, 0) / competitors.length;

  const totalMentions = competitors.reduce((s, c) => s + c.mentionCount, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Competitors</CardDescription>
            <CardTitle className="text-3xl">{competitors.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Mentions</CardDescription>
            <CardTitle className="text-3xl">{totalMentions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Sentiment</CardDescription>
            <CardTitle className="text-3xl">
              {avgSentiment > 0 ? "+" : ""}
              {avgSentiment.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitor Breakdown</CardTitle>
          <CardDescription>
            Click a row to view supporting review quotes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competitor</TableHead>
                <TableHead>Mentions</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Strengths</TableHead>
                <TableHead>Weaknesses</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((c) => (
                <CompetitorRow key={c.id} competitor={c} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
