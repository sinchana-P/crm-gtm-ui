"use client";

import {
  ArrowRight,
  CheckCircle2,
  FileUp,
  Link2,
  Mail,
  MessageCircle,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  {
    side: "crm" as const,
    icon: User,
    title: "Rep / Admin",
    description: "Select contact, checklist template, TTL & channels",
  },
  {
    side: "system" as const,
    icon: Mail,
    title: "Outbound",
    description: "Email, WhatsApp, SMS, or portal task with magic link",
  },
  {
    side: "portal" as const,
    icon: Link2,
    title: "Customer",
    description: "Secure upload page — no password if magic link",
  },
  {
    side: "crm" as const,
    icon: CheckCircle2,
    title: "CRM sync",
    description: "Files on contact record, owner notified, optional survey",
  },
];

export function CustomerJourneyDiagram() {
  return (
    <Card className="shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">End-to-end flow</CardTitle>
        <p className="text-sm text-muted-foreground">
          How document requests and feedback surveys move from CRM to customer portal —
          patterns used in HubSpot file requests, Salesforce Experience Cloud, and Zoho
          customer portal.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-1 items-center gap-2 lg:flex-col lg:gap-3">
              <div
                className={`flex flex-1 flex-col rounded-lg border p-4 ${
                  step.side === "portal"
                    ? "border-foreground/20 bg-muted/50"
                    : "bg-card"
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <step.icon className="size-4" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {step.side === "crm" ? "CRM" : step.side === "portal" ? "Portal" : "System"}
                  </span>
                </div>
                <p className="text-sm font-medium">{step.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
              </div>
              {i < STEPS.length - 1 ? (
                <ArrowRight className="size-4 shrink-0 text-muted-foreground lg:rotate-0" />
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
            <FileUp className="size-3" />
            Document collection
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
            <MessageCircle className="size-3" />
            WhatsApp deep link
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1">
            <Link2 className="size-3" />
            Magic link TTL
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
