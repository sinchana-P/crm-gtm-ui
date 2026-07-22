"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { ViewSwitcher } from "@/components/layout/view-switcher";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CURRENT_REP } from "@/lib/stores/view-level-store";

interface AppHeaderProps {
  breadcrumbs?: React.ReactNode;
}

export function AppHeader({ breadcrumbs }: AppHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <WorkspaceSwitcher />
      <div className="min-w-0 flex-1">{breadcrumbs}</div>

      <div className="relative hidden w-full max-w-xs lg:block">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search contacts, cases..."
          className="h-8 pl-8"
        />
      </div>

      <ViewSwitcher className="hidden sm:inline-flex" />

      <div className="flex items-center gap-1">
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

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="rounded-full">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">
                    {CURRENT_REP.initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{CURRENT_REP.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {CURRENT_REP.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Briefcase className="size-4" />
              Territory: {CURRENT_REP.territory}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
