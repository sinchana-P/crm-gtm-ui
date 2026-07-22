"use client";

import { useRouter, usePathname } from "next/navigation";
import { Building2, Check, ChevronsUpDown, LifeBuoy } from "lucide-react";
import { useWorkspaceStore, type Workspace } from "@/lib/stores/workspace-store";
import { useIntegrationStore } from "@/lib/stores/integration-store";
import { cn } from "@/lib/utils";
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

const WORKSPACES: {
  value: Workspace;
  name: string;
  role: string;
  icon: typeof Building2;
  href: string;
}[] = [
  {
    value: "crm",
    name: "Connect CRM",
    role: "Front office",
    icon: Building2,
    href: "/dashboard",
  },
  {
    value: "case-manager",
    name: "Case Manager",
    role: "Back office",
    icon: LifeBuoy,
    href: "/case-manager/home",
  },
];

export function WorkspaceSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);
  const connected = useIntegrationStore((s) => s.connection.connected);

  const active: Workspace = pathname.startsWith("/case-manager")
    ? "case-manager"
    : "crm";
  const current = WORKSPACES.find((w) => w.value === active) ?? WORKSPACES[0];

  const handleSelect = (w: (typeof WORKSPACES)[number]) => {
    setWorkspace(w.value);
    router.push(w.href);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className={cn("h-9 gap-2 px-2.5", className)}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-md text-primary-foreground",
                active === "case-manager" ? "bg-indigo-600" : "bg-primary"
              )}
            >
              <current.icon className="size-3.5" />
            </span>
            <span className="hidden flex-col items-start leading-none sm:flex">
              <span className="text-xs font-semibold">{current.name}</span>
              <span className="text-[10px] text-muted-foreground">{current.role}</span>
            </span>
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Switch workspace</span>
            <span
              className={cn(
                "flex items-center gap-1 text-[10px] font-normal",
                connected ? "text-emerald-600" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  connected ? "bg-emerald-500" : "bg-muted-foreground"
                )}
              />
              {connected ? "Integration connected" : "Not connected"}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {WORKSPACES.map((w) => (
          <DropdownMenuItem
            key={w.value}
            onClick={() => handleSelect(w)}
            className={cn("gap-3 py-2.5", active === w.value && "bg-muted")}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-md text-primary-foreground",
                w.value === "case-manager" ? "bg-indigo-600" : "bg-primary"
              )}
            >
              <w.icon className="size-4" />
            </span>
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{w.name}</span>
              <span className="text-xs text-muted-foreground">{w.role}</span>
            </div>
            {active === w.value && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
          Shared contacts &amp; two-way sync keep both workspaces in step.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
