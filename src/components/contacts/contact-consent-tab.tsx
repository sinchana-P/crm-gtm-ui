"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Monitor, Phone, SquareCheckBig } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContactRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ConsentStateBadge,
  type DisplayConsentState,
} from "@/components/settings/consent-state-badge";
import {
  CONSENT_CATEGORIES,
  LEGAL_BASIS_LABEL,
  captureSourceById,
  definitionsByCategory,
  type ConsentState,
} from "@/lib/mock-data/consent-policy";
import {
  buildContactConsent,
  type ContactConsentAuditEvent,
  type ContactConsentEntry,
} from "@/lib/mock-data/contact-consent";

const SEGMENTS: { value: ConsentState; label: string }[] = [
  { value: "opt-in", label: "In" },
  { value: "neutral", label: "—" },
  { value: "opt-out", label: "Out" },
];

const SEGMENT_ACTIVE: Record<ConsentState, string> = {
  "opt-in": "bg-emerald-600 text-white",
  neutral: "bg-amber-600 text-white",
  "opt-out": "bg-red-600 text-white",
};

const CAPTURE_ACTIONS = [
  { id: "portal", label: "Portal", icon: Monitor },
  { id: "email-doi", label: "Email opt-in", icon: Mail },
  { id: "form", label: "Web form", icon: SquareCheckBig },
  { id: "phone-confirm", label: "Phone → confirm", icon: Phone },
] as const;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sourceLabel(entry: ContactConsentEntry): string | null {
  if (entry.sourceId) return captureSourceById(entry.sourceId)?.name ?? entry.sourceId;
  if (entry.state !== "neutral") return "Manual (agent)";
  return null;
}

function isExpired(entry: ContactConsentEntry): boolean {
  return !!entry.expiresAt && new Date(entry.expiresAt) < new Date();
}

export function ContactConsentTab({ contact }: { contact: ContactRecord }) {
  const [record, setRecord] = useState(() => buildContactConsent(contact));

  function logEvent(event: Omit<ContactConsentAuditEvent, "id" | "when">) {
    setRecord((prev) => ({
      ...prev,
      audit: [
        { ...event, id: `${contact.id}-${Date.now()}`, when: new Date().toISOString() },
        ...prev.audit,
      ],
    }));
  }

  function setState(key: string, next: ConsentState, name: string) {
    setRecord((prev) => {
      const entry = prev.entries[key];
      const nowIso = new Date().toISOString();
      const collected = next !== "neutral";
      return {
        ...prev,
        entries: {
          ...prev.entries,
          [key]: {
            ...entry,
            state: next,
            sourceId: null,
            capturedAt: collected ? nowIso : null,
          },
        },
      };
    });
    const verb = next === "opt-in" ? "opted in" : next === "opt-out" ? "opted out" : "cleared";
    logEvent({ text: `${name} — ${verb}`, sourceLabel: "Manual (agent)" });
    toast.success(`${name}: ${verb}`);
  }

  function requestVia(sourceId: string) {
    const source = captureSourceById(sourceId);
    if (!source) return;
    if (sourceId === "phone-confirm") {
      setRecord((prev) => ({
        ...prev,
        entries: {
          ...prev.entries,
          "comm.phone.outreach": {
            ...prev.entries["comm.phone.outreach"],
            state: "provisional" as DisplayConsentState,
            sourceId: "phone-confirm",
            capturedAt: new Date().toISOString(),
          },
        },
      }));
      logEvent({
        text: "Phone outreach — provisional verbal consent, confirmation link sent",
        sourceLabel: source.name,
      });
      toast(`Verbal consent logged as provisional — confirmation link sent to ${contact.firstName}.`);
      return;
    }
    logEvent({ text: `Consent request sent via ${source.name}`, sourceLabel: source.name });
    toast.success(`Consent request sent to ${contact.firstName} via ${source.name}.`);
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Request consent from {contact.firstName}
          </CardTitle>
          <CardDescription>
            Consent is captured per individual. Pick a channel — proof is stored automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {CAPTURE_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => requestVia(action.id)}
              >
                <Icon className="mr-2 size-4" />
                {action.label}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {CONSENT_CATEGORIES.map((cat) => (
        <Card key={cat.id} className="shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{cat.label}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {definitionsByCategory(cat.id).map((def) => {
              const entry = record.entries[def.key];
              const src = sourceLabel(entry);
              const expired = isExpired(entry);
              return (
                <div
                  key={def.key}
                  className="flex flex-col gap-2 border-t py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium">{def.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
                      <span>
                        <span className="text-foreground/70">Basis</span>{" "}
                        {LEGAL_BASIS_LABEL[def.basis]}
                      </span>
                      {src ? (
                        <span>
                          <span className="text-foreground/70">Src</span> {src}
                        </span>
                      ) : null}
                      {entry.capturedAt ? (
                        <span>
                          <span className="text-foreground/70">Captured</span>{" "}
                          {fmtDate(entry.capturedAt)}
                        </span>
                      ) : null}
                      {entry.expiresAt ? (
                        <span className={cn(expired && "text-red-600 dark:text-red-400")}>
                          <span className="text-foreground/70">
                            {expired ? "Expired" : "Refresh by"}
                          </span>{" "}
                          {fmtDate(entry.expiresAt)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-none items-center gap-2 sm:justify-end">
                    <ConsentStateBadge state={entry.state} />
                    {def.toggleable ? (
                      <div
                        role="group"
                        aria-label={`Set ${def.name}`}
                        className="inline-flex rounded-lg border bg-muted p-0.5"
                      >
                        {SEGMENTS.map((seg) => {
                          const active = seg.value === entry.state;
                          return (
                            <button
                              key={seg.value}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setState(def.key, seg.value, def.name)}
                              className={cn(
                                "rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors",
                                active
                                  ? SEGMENT_ACTIVE[seg.value]
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {seg.label}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        Tracked only
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card className="shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Consent audit trail</CardTitle>
          <CardDescription>Append-only. Newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {record.audit.length === 0 ? (
            <p className="text-sm text-muted-foreground">No consent events yet.</p>
          ) : (
            <ol className="space-y-3">
              {record.audit.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "mt-1.5 size-2 flex-none rounded-full",
                      event.system ? "bg-muted-foreground" : "bg-primary",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm">{event.text}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {event.sourceLabel} · {fmtWhen(event.when)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
