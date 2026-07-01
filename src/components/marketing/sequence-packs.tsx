"use client";

import Link from "next/link";
import { ArrowRight, Gift, MessageSquare, PartyPopper, RotateCcw } from "lucide-react";
import { SEQUENCE_PACKS } from "@/lib/mock-data";
import type { SequencePack } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<SequencePack["category"], typeof Gift> = {
  welcome: Gift,
  "re-engage": RotateCcw,
  event: PartyPopper,
  feedback: MessageSquare,
};

export function SequencePacks() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Sequence packs</h2>
          <p className="text-sm text-muted-foreground">
            Prebuilt multi-step sequences ready to customize and activate.
          </p>
        </div>
        <ButtonLink href="/marketing/sequences" variant="outline" size="sm">
          View all sequences
        </ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SEQUENCE_PACKS.map((pack) => {
          const Icon = CATEGORY_ICONS[pack.category];
          return (
            <Card key={pack.id} className="shadow-none">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {pack.type}
                  </Badge>
                </div>
                <CardTitle className="text-sm">{pack.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  {pack.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <span className="text-xs text-muted-foreground">
                  {pack.steps} steps
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2"
                  onClick={() =>
                    toast.success(`"${pack.name}" added as draft sequence`)
                  }
                >
                  Use pack
                  <ArrowRight className="size-3.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
