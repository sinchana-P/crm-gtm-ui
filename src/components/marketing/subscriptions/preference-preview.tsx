"use client";

import { useState } from "react";
import { Check, CircleCheck, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUB_TOPICS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type PreviewState = "manage" | "unsubscribed" | "resubscribed" | "invalid";

const STATES: { value: PreviewState; label: string }[] = [
  { value: "manage", label: "Manage preferences" },
  { value: "unsubscribed", label: "Unsubscribed confirmation" },
  { value: "resubscribed", label: "Resubscribed" },
  { value: "invalid", label: "Invalid / expired link" },
];

// A framed mock of the hosted page the recipient sees via {{unsubscribeLink}}.
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-6">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 text-neutral-900 shadow-sm">
        {children}
      </div>
    </div>
  );
}

export function PreferencePreview() {
  const [state, setState] = useState<PreviewState>("manage");
  const [subs, setSubs] = useState<Record<string, boolean>>(
    Object.fromEntries(SUB_TOPICS.map((t) => [t.id, t.required || t.defaultOptIn]))
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          What contacts see when they click the unsubscribe / preferences link in an email.
        </p>
        <Select value={state} onValueChange={(v) => setState((v as PreviewState) ?? "manage")}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {state === "manage" && (
        <Frame>
          <div className="text-center">
            <div className="mx-auto mb-3 flex size-9 items-center justify-center rounded-lg bg-neutral-900 text-sm font-bold text-white">C</div>
            <p className="text-base font-semibold">Manage your email preferences</p>
            <p className="mt-1 text-xs text-neutral-500">brandon.fields@buckheadcloud.com</p>
          </div>
          <div className="mt-5 space-y-2">
            {SUB_TOPICS.map((t) => (
              <label key={t.id} className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.description}</p>
                  {t.required && <p className="mt-0.5 text-[11px] text-neutral-400">Required — always sent</p>}
                </div>
                <button
                  type="button"
                  disabled={t.required}
                  onClick={() => setSubs((s) => ({ ...s, [t.id]: !s[t.id] }))}
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border",
                    t.required
                      ? "border-neutral-300 bg-neutral-200 text-neutral-400"
                      : subs[t.id]
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-neutral-300 bg-white"
                  )}
                >
                  {(t.required || subs[t.id]) && <Check className="size-3.5" />}
                </button>
              </label>
            ))}
          </div>
          <button type="button" className="mt-5 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white">
            Save preferences
          </button>
          <p className="mt-3 text-center text-xs text-neutral-500 underline">Unsubscribe from all</p>
        </Frame>
      )}

      {state === "unsubscribed" && (
        <Frame>
          <div className="text-center">
            <CircleCheck className="mx-auto size-10 text-emerald-500" />
            <p className="mt-3 text-base font-semibold">You’ve been unsubscribed</p>
            <p className="mt-1 text-sm text-neutral-500">You won’t receive marketing emails from us anymore.</p>
          </div>
          <div className="mt-5">
            <p className="text-xs font-medium text-neutral-600">Mind sharing why? (optional)</p>
            <div className="mt-2 space-y-1.5">
              {["Too many emails", "No longer relevant", "Never signed up", "Content not useful"].map((r) => (
                <label key={r} className="flex items-center gap-2 rounded-md border border-neutral-200 p-2 text-sm">
                  <span className="size-3.5 rounded-full border border-neutral-300" /> {r}
                </label>
              ))}
            </div>
          </div>
          <p className="mt-5 text-center text-xs text-neutral-500">
            Changed your mind? <span className="font-medium text-neutral-900 underline">Resubscribe</span>
          </p>
        </Frame>
      )}

      {state === "resubscribed" && (
        <Frame>
          <div className="text-center">
            <CircleCheck className="mx-auto size-10 text-emerald-500" />
            <p className="mt-3 text-base font-semibold">Welcome back!</p>
            <p className="mt-1 text-sm text-neutral-500">You’re subscribed again and will start receiving our emails.</p>
            <button type="button" className="mt-5 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white">
              Manage preferences
            </button>
          </div>
        </Frame>
      )}

      {state === "invalid" && (
        <Frame>
          <div className="text-center">
            <TriangleAlert className="mx-auto size-10 text-amber-500" />
            <p className="mt-3 text-base font-semibold">This link is no longer valid</p>
            <p className="mt-1 text-sm text-neutral-500">
              The preferences link has expired or was already used. Request a new one from any recent email.
            </p>
          </div>
        </Frame>
      )}

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">How it stays in sync</CardTitle>
          <CardDescription>Any change here is enforced across the whole platform.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>• Opting out of a topic keeps the others active.</p>
          <p>• “Unsubscribe from all” sets a global opt-out.</p>
          <p>• Suppressed contacts are skipped on every send.</p>
          <p>• Resubscribing restores eligibility instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
