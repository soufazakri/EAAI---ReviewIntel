"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  Zap,
  Sparkles,
  Shield,
  MessageSquareText,
  BarChart3,
} from "lucide-react";
import type { ActionItem, Strategy } from "@/lib/data";

type Priority = ActionItem["priority"];
type Status = ActionItem["status"];

const priorityVariant: Record<Priority, "destructive" | "default" | "secondary"> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

const statusConfig: Record<Status, { label: string; icon: React.ReactNode }> = {
  todo: { label: "To Do", icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
  in_progress: {
    label: "In Progress",
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  },
  done: { label: "Done", icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
};

const strategyConfig: Record<Strategy, { label: string; color: string; icon: React.ReactNode }> = {
  exploit_weakness: {
    label: "Exploit Weakness",
    color: "text-red-600 bg-red-50 dark:bg-red-950/30",
    icon: <Target className="h-3.5 w-3.5" />,
  },
  outpace_strength: {
    label: "Outpace Strength",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    icon: <Zap className="h-3.5 w-3.5" />,
  },
  differentiate: {
    label: "Differentiate",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
    icon: <Sparkles className="h-3.5 w-3.5" />,
  },
  counter_position: {
    label: "Counter-Position",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    icon: <Shield className="h-3.5 w-3.5" />,
  },
};

export function ActionItemsTab({
  actionItems,
}: {
  actionItems: ActionItem[];
}) {
  const todo = actionItems.filter((i) => i.status === "todo").length;
  const inProgress = actionItems.filter((i) => i.status === "in_progress").length;
  const done = actionItems.filter((i) => i.status === "done").length;

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
        {actionItems.map((item) => {
          const strat = strategyConfig[item.strategy];
          return (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={priorityVariant[item.priority]}>
                    {item.priority}
                  </Badge>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${strat.color}`}
                  >
                    {strat.icon}
                    {strat.label}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    vs. {item.competitorName}
                  </span>
                </div>
                <CardTitle className="text-base leading-snug pt-1">
                  {item.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Insight */}
                <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <MessageSquareText className="h-3.5 w-3.5" />
                    Competitive Insight
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {item.insight}
                  </p>
                </div>

                {/* Action */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Target className="h-3.5 w-3.5" />
                    Recommended Action
                  </div>
                  <p className="text-sm leading-relaxed">
                    {item.action}
                  </p>
                </div>

                {/* Impact */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Expected Impact
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.impact}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {statusConfig[item.status].icon}
                      <span>{statusConfig[item.status].label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {item.confidencePercent}% confidence
                    </span>
                    {item.status !== "done" && (
                      <Button variant="outline" size="sm">
                        {item.status === "todo" ? "Start" : "Mark Complete"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
