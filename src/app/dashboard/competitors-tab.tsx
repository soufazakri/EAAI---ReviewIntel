"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Competitor } from "@/lib/data";

const sentimentColor = {
  positive: "default",
  mixed: "secondary",
  negative: "destructive",
} as const;

function TrendIcon({ trend }: { trend: "up" | "down" | "neutral" }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-600" />;
  if (trend === "down")
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

export function CompetitorsTab({
  competitors,
}: {
  competitors: Competitor[];
}) {
  const avgRating =
    competitors.length > 0
      ? competitors.reduce((s, c) => s + c.rating, 0) / competitors.length
      : 0;

  const totalReviews = competitors.reduce((s, c) => s + c.reviews, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Competitors Tracked</CardDescription>
            <CardTitle className="text-3xl">{competitors.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Competitor Rating</CardDescription>
            <CardTitle className="text-3xl">{avgRating.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Reviews Analyzed</CardDescription>
            <CardTitle className="text-3xl">
              {totalReviews.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competitor Breakdown</CardTitle>
          <CardDescription>
            Review sentiment and trend analysis for each competitor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competitor</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Top Strength</TableHead>
                <TableHead>Top Weakness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitors.map((c) => (
                <TableRow key={c.name}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {c.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{c.rating}</TableCell>
                  <TableCell>{c.reviews.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={sentimentColor[c.sentiment]}>
                      {c.sentiment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TrendIcon trend={c.trend} />
                  </TableCell>
                  <TableCell className="text-green-600">
                    {c.topStrength}
                  </TableCell>
                  <TableCell className="text-red-500">
                    {c.topWeakness}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
