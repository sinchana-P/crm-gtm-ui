"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlarmClock,
  BarChart3,
  Briefcase,
  Calendar,
  FileInput,
  FolderKanban,
  Home,
  LifeBuoy,
  Moon,
  Search,
  Settings,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { CURRENT_REP } from "@/lib/stores/view-level-store";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const NAV: { label: string; href: string; icon: LucideIcon; badge?: string }[] = [
  { label: "Home", href: "/case-manager/home", icon: Home },
  { label: "Projects", href: "/case-manager/projects", icon: FolderKanban },
  { label: "My Cases", href: "/case-manager/my-cases", icon: Briefcase },
  { label: "Cases", href: "/case-manager/cases", icon: LifeBuoy },
  { label: "Queues", href: "/case-manager/queues", icon: AlarmClock },
  { label: "Calendar", href: "/case-manager/calendar", icon: Calendar },
  { label: "Inquiry", href: "/case-manager/inquiry", icon: FileInput },
  { label: "Analytics", href: "/case-manager/analytics", icon: BarChart3 },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <div
      data-workspace="case-manager"
      className="flex h-dvh min-h-0 overflow-hidden bg-background"
    >
      {/* Sidebar — indigo-accented to signal the back-office workspace */}
      <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-indigo-500/15 bg-indigo-950 text-indigo-50 dark:bg-indigo-950/60">
        <div className="flex h-14 items-center gap-2 border-b border-white/10 px-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500 text-white">
            <LifeBuoy className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Case Manager</p>
            <p className="truncate text-xs text-indigo-300">Back office</p>
          </div>
        </div>
        <ScrollArea className="flex-1 px-2 py-3">
          <nav className="flex flex-col gap-0.5">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-indigo-500/25 font-medium text-white"
                      : "text-indigo-200 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="size-4 shrink-0 opacity-80" />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="border-t border-white/10 p-2">
          <Link
            href="/case-manager/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              isActive(pathname, "/case-manager/settings")
                ? "bg-indigo-500/25 font-medium text-white"
                : "text-indigo-200 hover:bg-white/5 hover:text-white"
            )}
          >
            <Settings className="size-4 opacity-80" /> Settings
          </Link>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
          <WorkspaceSwitcher />
          <div className="relative hidden w-full max-w-xs lg:block">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search cases, projects…" className="h-8 pl-8" />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {mounted ? (isDark ? <Sun className="size-4" /> : <Moon className="size-4" />) : <span className="size-4" />}
            </Button>
            <Avatar className="size-7">
              <AvatarFallback className="text-xs">{CURRENT_REP.initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
