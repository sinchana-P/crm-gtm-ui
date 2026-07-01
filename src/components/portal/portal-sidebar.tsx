"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  ClipboardList,
  FileInput,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  PenLine,
  User,
  type LucideIcon,
} from "lucide-react";
import { getPortalNavWithBadges } from "@/lib/portal-navigation";
import { PORTAL_CUSTOMER } from "@/lib/mock-data/portal";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  LifeBuoy,
  FolderOpen,
  FileInput,
  PenLine,
  ClipboardList,
  User,
  CircleHelp,
};

export function PortalSidebar() {
  const pathname = usePathname();
  const items = getPortalNavWithBadges();

  return (
    <aside className="flex h-full min-h-0 w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
        <Link href="/portal" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
            C
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              Customer Portal
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {PORTAL_CUSTOMER.company}
            </p>
          </div>
        </Link>
      </div>
      <ScrollArea className="relative min-h-0 flex-1">
        <nav className="space-y-1 p-2">
          {items.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
            const active =
              item.href === "/portal"
                ? pathname === "/portal"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.badge ? (
                  <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <Separator className="my-3" />
        <div className="px-4 pb-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Account owner</p>
          <p className="mt-1">{PORTAL_CUSTOMER.accountOwner}</p>
          <p>{PORTAL_CUSTOMER.accountOwnerEmail}</p>
        </div>
      </ScrollArea>
    </aside>
  );
}
