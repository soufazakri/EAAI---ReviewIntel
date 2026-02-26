"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitorsTab } from "./competitors-tab";
import { ActionItemsTab } from "./action-items-tab";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const { competitors, actionItems, industryLabel, isReady } = useAppStore();

  if (!isReady) return null;

  const hasData = competitors.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          {hasData
            ? `Tracking ${competitors.length} competitor${competitors.length !== 1 ? "s" : ""} in ${industryLabel}.`
            : "Complete onboarding to start tracking competitors."}
        </p>
      </div>

      {hasData ? (
        <Tabs defaultValue="competitors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="competitors">Competitors</TabsTrigger>
            <TabsTrigger value="actions">Action Items</TabsTrigger>
          </TabsList>

          <TabsContent value="competitors">
            <CompetitorsTab competitors={competitors} />
          </TabsContent>

          <TabsContent value="actions">
            <ActionItemsTab actionItems={actionItems} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <p className="text-lg font-medium">No competitors tracked yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Go through onboarding to select your industry and competitors.
          </p>
          <a
            href="/onboarding"
            className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            Start Onboarding
          </a>
        </div>
      )}
    </div>
  );
}
