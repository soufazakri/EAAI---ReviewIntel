"use client";

import Link from "next/link";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
  const { industryLabel, competitors } = useAppStore();

  return (
    <div className="flex h-screen">
      <aside className="flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div className="flex h-14 items-center px-6 font-semibold text-lg">
          <Link href="/dashboard">ReviewIntel</Link>
        </div>
        <Separator />

        {industryLabel && (
          <div className="px-4 py-3">
            <div className="rounded-lg bg-sidebar-accent px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">Industry</p>
              <p className="text-sm font-semibold">{industryLabel}</p>
              {competitors.length > 0 && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {competitors.length} tracked
                </Badge>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="p-3">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="flex h-14 items-center border-b px-6">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
