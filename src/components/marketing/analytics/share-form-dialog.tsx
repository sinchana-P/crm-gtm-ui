"use client";

import { useMemo, useState } from "react";
import { Lock, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type UtmKey =
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_term"
  | "utm_content";

const UTM_KEYS: UtmKey[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

type StdParams = Record<UtmKey, string>;
type CustomParam = { id: string; key: string; value: string };

interface Channel {
  id: string;
  name: string;
  initial: string;
  color: string;
  preset: Partial<StdParams>;
}

const CAMPAIGN = "connect_with_tag";

const CHANNELS: Channel[] = [
  { id: "instagram", name: "Instagram", initial: "Ig", color: "#E1306C", preset: { utm_source: "instagram", utm_medium: "social", utm_content: "bio_link" } },
  { id: "facebook", name: "Facebook", initial: "f", color: "#1877F2", preset: { utm_source: "facebook", utm_medium: "social" } },
  { id: "linkedin", name: "LinkedIn", initial: "in", color: "#0A66C2", preset: { utm_source: "linkedin", utm_medium: "social" } },
  { id: "whatsapp", name: "WhatsApp", initial: "W", color: "#25D366", preset: { utm_source: "whatsapp", utm_medium: "chat" } },
  { id: "email", name: "Gmail / Email", initial: "@", color: "#EA4335", preset: { utm_source: "newsletter", utm_medium: "email" } },
  { id: "google-ads", name: "Google Ads", initial: "G", color: "#4285F4", preset: { utm_source: "google", utm_medium: "cpc" } },
  { id: "x", name: "X (Twitter)", initial: "X", color: "#0f0f0f", preset: { utm_source: "twitter", utm_medium: "social" } },
];

function presetFor(ch: Channel): StdParams {
  return {
    utm_source: ch.preset.utm_source ?? "",
    utm_medium: ch.preset.utm_medium ?? "",
    utm_campaign: CAMPAIGN,
    utm_term: "",
    utm_content: ch.preset.utm_content ?? "",
  };
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  formName: string;
  baseUrl: string;
}

export function ShareFormDialog({ open, onOpenChange, formName, baseUrl }: Props) {
  const [channelId, setChannelId] = useState(CHANNELS[0].id);
  const [params, setParams] = useState<StdParams>(presetFor(CHANNELS[0]));
  const [custom, setCustom] = useState<CustomParam[]>([]);

  const channel = CHANNELS.find((c) => c.id === channelId) ?? CHANNELS[0];
  const filledCount =
    UTM_KEYS.filter((k) => params[k].trim()).length +
    custom.filter((c) => c.key.trim() && c.value.trim()).length;

  const url = useMemo(() => {
    const qs = new URLSearchParams();
    UTM_KEYS.forEach((k) => {
      if (params[k].trim()) qs.set(k, params[k].trim());
    });
    custom.forEach((c) => {
      if (c.key.trim() && c.value.trim()) qs.set(c.key.trim(), c.value.trim());
    });
    const q = qs.toString();
    return q ? `${baseUrl}?${q}` : baseUrl;
  }, [params, custom, baseUrl]);

  function selectChannel(id: string) {
    const ch = CHANNELS.find((c) => c.id === id) ?? CHANNELS[0];
    setChannelId(id);
    setParams(presetFor(ch));
    setCustom([]);
  }

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Share {formName}
          </DialogTitle>
          <DialogDescription>
            Build a tracked link for each channel — every source you post to is attributed automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Generated URL */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Tracked URL — {channel.name}
          </p>
          <div className="flex gap-2">
            <Input readOnly value={url} className="font-mono text-xs" />
            <Button onClick={() => copy(url, "Link")}>Copy</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Base:{" "}
            <button
              type="button"
              className="underline underline-offset-2"
              onClick={() => copy(baseUrl, "Base URL")}
            >
              {baseUrl}
            </button>
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-[190px_1fr]">
          {/* Channels */}
          <div className="space-y-1">
            {CHANNELS.map((c) => {
              const activeC = c.id === channelId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectChannel(c.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    activeC ? "border-primary bg-primary/5 font-medium" : "border-transparent hover:bg-muted"
                  )}
                >
                  <span
                    className="flex size-7 items-center justify-center rounded-md text-xs font-semibold text-white"
                    style={{ background: c.color }}
                  >
                    {c.initial}
                  </span>
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Params */}
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-sm font-medium">
                  Standard UTM parameters
                  <Badge variant="outline" className="border-0 bg-primary/10 text-primary">
                    {filledCount}
                  </Badge>
                </p>
                <Button variant="ghost" size="sm" onClick={() => selectChannel(channelId)}>
                  <RotateCcw className="size-3.5" /> Reset
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                The five recognised UTM keys. Keys are fixed — edit the values. Blank values are skipped.
              </p>
              <div className="mt-3 space-y-2">
                {UTM_KEYS.map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="flex w-40 items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
                      <Lock className="size-3" />
                      <span className="font-mono">{k}</span>
                    </div>
                    <span className="text-muted-foreground">=</span>
                    <Input
                      value={params[k]}
                      placeholder="(empty — not added)"
                      onChange={(e) => setParams((p) => ({ ...p, [k]: e.target.value }))}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Clear ${k}`}
                      onClick={() => setParams((p) => ({ ...p, [k]: "" }))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Custom parameters</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add any extra query params (e.g. ref, gclid, affiliate_id). Keys and values are both editable.
              </p>
              <div className="mt-3 space-y-2">
                {custom.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <Input
                      value={c.key}
                      placeholder="key"
                      className="w-40 font-mono text-xs"
                      onChange={(e) =>
                        setCustom((list) => list.map((x) => (x.id === c.id ? { ...x, key: e.target.value } : x)))
                      }
                    />
                    <span className="text-muted-foreground">=</span>
                    <Input
                      value={c.value}
                      placeholder="value"
                      onChange={(e) =>
                        setCustom((list) => list.map((x) => (x.id === c.id ? { ...x, value: e.target.value } : x)))
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove parameter"
                      onClick={() => setCustom((list) => list.filter((x) => x.id !== c.id))}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustom((list) => [...list, { id: `cp${list.length}-${Date.now()}`, key: "", value: "" }])
                  }
                >
                  <Plus className="size-4" /> Add parameter
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => copy(url, "Link")}>Copy tracked link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
