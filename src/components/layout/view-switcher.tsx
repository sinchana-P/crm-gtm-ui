"use client";

import { useRouter } from "next/navigation";
import {
  Globe,
  Shield,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ViewLevel } from "@/lib/stores/view-level-store";
import { useViewLevelStore } from "@/lib/stores/view-level-store";
import { useClientStoresHydrated } from "@/hooks/use-client-stores-hydrated";
import { cn } from "@/lib/utils";
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

export const APP_VIEW_OPTIONS: {
  value: ViewLevel;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
}[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Organization metrics & configuration",
    icon: Shield,
    href: "/dashboard",
  },
  {
    value: "representative",
    label: "Representative",
    description: "Assigned records & daily priorities",
    icon: UserRound,
    href: "/dashboard",
  },
  {
    value: "customer-portal",
    label: "Customer portal",
    description: "Self-service for end customers",
    icon: Globe,
    href: "/portal",
  },
];

interface ViewSwitcherProps {
  className?: string;
  /** Current surface when on portal routes */
  activeOverride?: ViewLevel;
}

export function ViewSwitcher({ className, activeOverride }: ViewSwitcherProps) {
  const router = useRouter();
  const level = useViewLevelStore((s) => s.level);
  const setLevel = useViewLevelStore((s) => s.setLevel);
  const hydrated = useClientStoresHydrated();

  const activeValue = activeOverride ?? (hydrated ? level : "admin");
  const activeView =
    APP_VIEW_OPTIONS.find((v) => v.value === activeValue) ?? APP_VIEW_OPTIONS[0];

  const handleSelect = (next: ViewLevel) => {
    const option = APP_VIEW_OPTIONS.find((o) => o.value === next);
    if (!option) return;
    setLevel(next);
    router.push(option.href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 gap-2", className)}
          >
            <activeView.icon className="size-3.5" />
            <span className="hidden sm:inline">{activeView.label}</span>
            <span className="sm:hidden">View</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Switch experience</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {APP_VIEW_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={cn(
              "flex flex-col items-start gap-0.5 py-2",
              activeValue === option.value && "bg-muted"
            )}
          >
            <div className="flex w-full items-center gap-2">
              <option.icon className="size-4" />
              <span className="font-medium">{option.label}</span>
              {activeValue === option.value && hydrated ? (
                <Badge variant="secondary" className="ml-auto text-[10px]">
                  Active
                </Badge>
              ) : null}
            </div>
            <span className="pl-6 text-xs text-muted-foreground">
              {option.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
