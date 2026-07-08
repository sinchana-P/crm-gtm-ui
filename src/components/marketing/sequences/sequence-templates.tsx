"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Gift,
  MessageSquare,
  PartyPopper,
  Rocket,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { SequenceTemplate } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SEQUENCE_TEMPLATES } from "@/lib/mock-data";
import { countSteps } from "@/components/marketing/sequences/sequence-shared";

const CATEGORY_ICONS: Record<SequenceTemplate["category"], typeof Gift> = {
  welcome: Gift,
  "re-engage": RotateCcw,
  event: PartyPopper,
  feedback: MessageSquare,
  onboarding: Rocket,
  sales: Sparkles,
};

export function SequenceTemplates() {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Start from a template</h2>
        <p className="text-sm text-muted-foreground">
          Pre-built, best-practice flows you can customize and activate.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_SEQUENCE_TEMPLATES.map((tpl) => {
          const Icon = CATEGORY_ICONS[tpl.category];
          return (
            <Card key={tpl.id} className="flex flex-col shadow-none">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <Badge variant="outline" className="capitalize">{tpl.type}</Badge>
                </div>
                <CardTitle className="text-sm">{tpl.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  {tpl.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {countSteps(tpl.flow)} steps · {tpl.channel}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/marketing/sequences/new?template=${tpl.id}`)}
                >
                  Use
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
