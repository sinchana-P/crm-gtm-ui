"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getVisibleNav } from "@/lib/navigation";
import { getNavIcon } from "@/lib/icons";
import type { NavItem } from "@/lib/types";
import { useClientStoresHydrated } from "@/hooks/use-client-stores-hydrated";
import { usePluginStore } from "@/lib/stores/plugin-store";
import { useViewLevelStore } from "@/lib/stores/view-level-store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function hasActiveChild(pathname: string, item: NavItem): boolean {
  if (item.href && isActiveRoute(pathname, item.href)) return true;
  return item.children?.some((child) => hasActiveChild(pathname, child)) ?? false;
}

function ItemBadge({ value }: { value: string }) {
  return (
    <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
      {value}
    </span>
  );
}

function NavLeaf({
  item,
  pathname,
  nested,
}: {
  item: NavItem;
  pathname: string;
  nested?: boolean;
}) {
  const Icon = getNavIcon(item.icon);
  const active = item.href ? isActiveRoute(pathname, item.href) : false;
  return (
    <Link
      href={item.href ?? "#"}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        nested && "py-1",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/60"
      )}
    >
      <Icon className={cn("shrink-0", nested ? "size-3.5 opacity-70" : "size-4")} />
      <span className="truncate">{item.label}</span>
      {item.badge ? <ItemBadge value={item.badge} /> : null}
    </Link>
  );
}

function NavParent({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = getNavIcon(item.icon);
  const childActive = hasActiveChild(pathname, item);

  return (
    <Collapsible defaultOpen={childActive}>
      <CollapsibleTrigger
        className={cn(
          "group/parent flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
          childActive
            ? "font-medium text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60"
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{item.label}</span>
        <ChevronRight className="ml-auto size-3.5 shrink-0 opacity-60 transition-transform group-data-[panel-open]/parent:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3 ml-3.5">
          {item.children?.map((child) => (
            <li key={child.id}>
              <NavLeaf item={child} pathname={pathname} nested />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const hydrated = useClientStoresHydrated();
  const isEnabled = usePluginStore((s) => s.isEnabled);
  const viewLevel = useViewLevelStore((s) => s.level);
  const effectiveViewLevel = hydrated ? viewLevel : "admin";
  const sections = getVisibleNav(isEnabled, effectiveViewLevel);

  return (
    <aside className="flex h-full min-h-0 w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold tracking-tight">
            C
          </div>
          <span className="text-sm font-semibold tracking-tight">Connect CRM</span>
        </Link>
      </div>
      <ScrollArea className="relative min-h-0 flex-1">
        <nav className="space-y-4 px-2 py-3">
          {sections.map((section) => (
            <div key={section.section}>
              <p className="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    {item.children?.length ? (
                      <NavParent item={item} pathname={pathname} />
                    ) : (
                      <NavLeaf item={item} pathname={pathname} />
                    )}
                  </li>
                ))}
              </ul>
              <Separator className="mt-3" />
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
