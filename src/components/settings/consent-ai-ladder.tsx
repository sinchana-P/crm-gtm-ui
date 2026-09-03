"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AI_LADDER } from "@/lib/mock-data/consent-policy";

/**
 * Escalating document → AI permission. Each rung unlocks only when the rung
 * below it is granted; withdrawing a lower rung cascades and blocks the ones above.
 */
export function ConsentAiLadder() {
  const [granted, setGranted] = useState<Record<string, boolean>>({
    "data.doc.read": true,
    "data.ai.infer": true,
    "data.ai.train": false,
  });

  const keys = AI_LADDER.map((s) => s.key).filter(Boolean) as string[];

  function toggle(key: string, next: boolean) {
    setGranted((prev) => {
      const updated = { ...prev, [key]: next };
      if (!next) {
        // cascade: withdrawing a rung blocks every rung above it
        const idx = keys.indexOf(key);
        for (const above of keys.slice(idx + 1)) updated[above] = false;
      }
      return updated;
    });
    const step = AI_LADDER.find((s) => s.key === key);
    if (step) {
      toast[next ? "success" : "warning"](
        `${step.title} ${next ? "granted" : "withdrawn"}${
          next ? "" : " — dependent steps blocked"
        }`,
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Document &amp; AI processing ladder</CardTitle>
        <CardDescription>
          Escalating permission for records a contact submits. Each rung unlocks only when the one
          below it is granted — <span className="font-medium">submit → read → infer → train</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0">
          {AI_LADDER.map((step, i) => {
            const isReceived = step.key === null;
            const on = isReceived || !!granted[step.key!];
            const prevKey = i > 0 ? AI_LADDER[i - 1].key : null;
            const prevOn = i === 0 || prevKey === null || !!granted[prevKey];
            const locked = !isReceived && !prevOn;
            const isLast = i === AI_LADDER.length - 1;

            return (
              <li key={step.title} className="relative flex gap-4 pb-5 last:pb-0">
                {!isLast ? (
                  <span
                    aria-hidden
                    className="absolute left-4 top-9 h-[calc(100%-1.5rem)] w-px bg-border"
                  />
                ) : null}
                <div
                  className={cn(
                    "z-10 flex size-8 flex-none items-center justify-center rounded-full border-2 bg-background",
                    on
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                      : locked
                        ? "border-border text-muted-foreground"
                        : "border-amber-500 text-amber-600",
                  )}
                >
                  {isReceived ? (
                    <FileText className="size-4" />
                  ) : on ? (
                    <Check className="size-4" />
                  ) : locked ? (
                    <Lock className="size-3.5" />
                  ) : (
                    <span className="font-mono text-xs">{i}</span>
                  )}
                </div>

                <div className={cn("flex-1 pt-0.5", locked && "opacity-60")}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{step.title}</p>
                      {isReceived ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        >
                          Received
                        </Badge>
                      ) : null}
                    </div>
                    {!isReceived ? (
                      <Switch
                        checked={on}
                        disabled={locked}
                        onCheckedChange={(v) => toggle(step.key!, v)}
                        aria-label={step.title}
                      />
                    ) : null}
                  </div>
                  <p className="mt-0.5 max-w-prose text-xs text-muted-foreground">
                    {step.description}
                  </p>
                  {locked ? (
                    <p className="mt-1 font-mono text-[11px] text-red-600 dark:text-red-400">
                      Blocked — grant the step below first.
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
