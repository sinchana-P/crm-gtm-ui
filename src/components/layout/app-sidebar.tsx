"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Puzzle } from "lucide-react";
import { getVisibleNav } from "@/lib/navigation";
import { getNavIcon } from "@/lib/icons";
import { usePluginStore } from "@/lib/stores/plugin-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const PLUGIN_SECTIONS = new Set(["marketing", "cases", "esign"]);

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();
  const isEnabled = usePluginStore((s) => s.isEnabled);
  const sections = getVisibleNav(isEnabled);

  return (
    <aside
      className="flex h-full w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      data-slot="app-sidebar"
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <span className="text-xs font-bold tracking-tight">CN</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Connect CRM</p>
          <p className="truncate text-xs text-muted-foreground">GTM Workspace</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-1">
          {sections.map((group, index) => {
            const hasActiveItem = group.items.some((item) =>
              item.href ? isActiveRoute(pathname, item.href) : false
            );
            const showPluginBadge =
              PLUGIN_SECTIONS.has(group.section) && isEnabled(group.section as "marketing" | "cases" | "esign");

            return (
              <Collapsible
                key={group.section}
                defaultOpen={hasActiveItem || group.section === "core"}
              >
                <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                  <ChevronDown className="size-3.5 shrink-0 -rotate-90 transition-transform data-[panel-open]:rotate-0" />
                  <span className="flex-1 truncate">{group.label}</span>
                  {showPluginBadge && (
                    <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-normal">
                      <Puzzle className="size-2.5" />
                      Plugin
                    </Badge>
                  )}
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-0.5 space-y-0.5 pl-1">
                  {group.items.map((item) => {
                    const Icon = getNavIcon(item.icon);
                    const active = item.href
                      ? isActiveRoute(pathname, item.href)
                      : false;
                    const showItemBadge =
                      item.badge && (!item.plugin || isEnabled(item.plugin));

                    return (
                      <Link
                        key={item.id}
                        href={item.href ?? "#"}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="size-4 shrink-0 opacity-70" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {showItemBadge && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </CollapsibleContent>

                {index < sections.length - 1 && <Separator className="my-2" />}
              </Collapsible>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
