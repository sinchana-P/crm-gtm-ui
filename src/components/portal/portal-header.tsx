"use client";

import { useEffect, useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ViewSwitcher } from "@/components/layout/view-switcher";
import { PORTAL_CUSTOMER, PORTAL_NOTIFICATIONS } from "@/lib/mock-data/portal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function PortalHeader() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const unread = PORTAL_NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => setMounted(true), []);

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {PORTAL_CUSTOMER.firstName} {PORTAL_CUSTOMER.lastName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {PORTAL_CUSTOMER.company}
        </p>
      </div>

      <ViewSwitcher activeOverride="customer-portal" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="relative">
              <Bell className="size-4" />
              {unread > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {unread}
                </span>
              ) : null}
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {PORTAL_NOTIFICATIONS.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-2">
              <div className="flex w-full items-center gap-2">
                <span className="text-sm font-medium">{n.title}</span>
                {!n.read ? (
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    New
                  </Badge>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">{n.body}</span>
              {n.href ? (
                <Link href={n.href} className="text-xs underline-offset-4 hover:underline">
                  View
                </Link>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {mounted ? (
          isDark ? <Sun className="size-4" /> : <Moon className="size-4" />
        ) : (
          <span className="size-4" />
        )}
      </Button>

      <Link
        href="/portal/profile"
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-7">
          <AvatarFallback className="text-xs">
            {PORTAL_CUSTOMER.avatarInitials}
          </AvatarFallback>
        </Avatar>
      </Link>
    </header>
  );
}
