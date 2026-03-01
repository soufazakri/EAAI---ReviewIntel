"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  LogOut,
  Upload,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { competitors, reviewCount, analysisStatus, signOut, error } = useAppStore();

  return (
    <div className="flex h-screen">
      <aside className="flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground max-md:hidden">
        <div className="flex h-14 items-center px-6 font-semibold text-lg">
          <Link href="/dashboard">ReviewIntel</Link>
        </div>
        <Separator />

        {analysisStatus === "complete" && (
          <div className="px-4 py-3">
            <div className="rounded-lg bg-sidebar-accent px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                HR Tech SaaS
              </p>
              <p className="text-sm font-semibold">
                {reviewCount} reviews analyzed
              </p>
              {competitors.length > 0 && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {competitors.length} competitors
                </Badge>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}

          <Separator className="my-3" />

          <Link
            href="/onboarding"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload New Data
          </Link>
        </nav>

        <Separator />
        <div className="p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="flex h-14 items-center justify-between border-b px-6">
          <h1 className="text-lg font-semibold">
            {navItems.find(
              (n) =>
                n.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(n.href)
            )?.label ?? "Dashboard"}
          </h1>

          {/* Mobile menu button */}
          <Link
            href="/onboarding"
            className="md:hidden inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Link>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
