"use client";

import { formatDistanceToNow } from "date-fns";
import { Sparkles } from "lucide-react";
import type { ContactRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LifecycleBadge } from "@/components/shared/lifecycle-badge";
import { HealthBadge } from "@/components/shared/health-badge";

interface AiRecordBriefProps {
  contact: ContactRecord;
}

function buildBrief(contact: ContactRecord): string {
  const name = `${contact.firstName} ${contact.lastName}`;
  const company = contact.company ? ` at ${contact.company}` : "";
  const engagement = contact.engagement.daysSinceContact;
  const stage = contact.lifecycleStage.toUpperCase();

  const lines = [
    `${name}${company} is a ${stage} with a lead score of ${contact.leadScore}.`,
    `Last engaged ${engagement} day${engagement === 1 ? "" : "s"} ago via ${contact.lastActivity.toLowerCase()}.`,
  ];

  if (contact.nextActivity) {
    lines.push(`Recommended next step: ${contact.nextActivity}.`);
  }

  if (contact.openCases) {
    lines.push(`${contact.openCases} open case${contact.openCases > 1 ? "s" : ""} require attention.`);
  }

  if (contact.duplicateFlag) {
    lines.push("Potential duplicate detected — review before outreach.");
  }

  return lines.join(" ");
}

export function AiRecordBrief({ contact }: AiRecordBriefProps) {
  return (
    <Card className="border-dashed bg-muted/30 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4 text-muted-foreground" />
          AI Record Brief
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-foreground/90">{buildBrief(contact)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <LifecycleBadge stage={contact.lifecycleStage} />
          {contact.slaStatus && (
            <HealthBadge status={contact.slaStatus} variant="sla" />
          )}
          <span className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(contact.engagement.lastTouchAt), { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
