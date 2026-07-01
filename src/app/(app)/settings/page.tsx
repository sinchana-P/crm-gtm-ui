"use client";

import Link from "next/link";
import { Bell, Columns3, Lock, Plug, Puzzle, Route, Settings, Target, User } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useViewScope } from "@/hooks/use-view-scope";

const adminSections = [
  {
    title: "Plugins",
    description: "Enable or disable Marketing, Case Manager, and E-sign modules.",
    href: "/settings/plugins",
    icon: Puzzle,
  },
  {
    title: "Assignment rules",
    description: "Round-robin and territory-based routing for leads and cases.",
    href: "/settings/assignment",
    icon: Route,
  },
  {
    title: "Lead scoring",
    description: "Rule-based, behavioral, and AI scoring models.",
    href: "/settings/scoring",
    icon: Target,
  },
  {
    title: "Custom fields",
    description: "Field definitions and layout editor per object type.",
    href: "/settings/fields",
    icon: Columns3,
  },
  {
    title: "Consent & privacy",
    description: "Default consent policies and preference center.",
    href: "/settings/consent",
    icon: Lock,
  },
  {
    title: "Integrations",
    description: "Kaayaka, e-sign providers, WhatsApp, and email sync.",
    href: "/settings/integrations",
    icon: Plug,
  },
];

const repSections = [
  {
    title: "Preferences",
    description: "Notification defaults, timezone, and signature for outbound messages.",
    href: "#",
    icon: Bell,
  },
  {
    title: "Profile",
    description: "Your name, territory, and contact details.",
    href: "#",
    icon: User,
  },
];

export default function SettingsPage() {
  const { isRep, rep } = useViewScope();
  const sections = isRep ? repSections : adminSections;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description={
          isRep
            ? `Personal preferences for ${rep.name}. Organization settings require Admin view.`
            : "Configure plugins, routing, scoring, fields, consent, and integrations."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const inner = (
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary">Configure</span>
              </CardContent>
            </Card>
          );

          return section.href === "#" ? (
            <div key={section.title}>{inner}</div>
          ) : (
            <Link key={section.href} href={section.href}>
              {inner}
            </Link>
          );
        })}
      </div>

      {!isRep && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-muted-foreground" />
              <CardTitle className="text-base">Workspace</CardTitle>
            </div>
            <CardDescription>
              Organization defaults, branding, and user management are managed at the workspace level.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
