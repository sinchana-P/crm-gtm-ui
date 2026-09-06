"use client";

import type { FormConsentItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { collectableConsents, definitionByKey } from "@/lib/mock-data/consent-policy";

/**
 * The form's consent section — one row per available consent. The visitor
 * answers every included consent (its own opt-in checkbox on the form).
 */
export function ConsentSectionEditor({
  consents,
  onChange,
}: {
  consents: FormConsentItem[];
  onChange: (consents: FormConsentItem[]) => void;
}) {
  const byKey = new Map(consents.map((c) => [c.key, c]));
  const all = collectableConsents();

  function toggleInclude(key: string, include: boolean) {
    if (include) {
      const def = definitionByKey(key);
      onChange([...consents, { key, label: defaultLabel(def?.name ?? key), yesLabel: "Yes" }]);
    } else {
      onChange(consents.filter((c) => c.key !== key));
    }
  }

  function patch(key: string, p: Partial<FormConsentItem>) {
    onChange(consents.map((c) => (c.key === key ? { ...c, ...p } : c)));
  }

  const includeAll = () =>
    onChange(
      all.map((def) => byKey.get(def.key) ?? { key: def.key, label: defaultLabel(def.name), yesLabel: "Yes" }),
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          The visitor answers each included consent. Include only what this form actually collects.
        </p>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={includeAll}>
          Include all
        </Button>
      </div>

      {all.map((def) => {
        const item = byKey.get(def.key);
        const included = !!item;
        return (
          <div
            key={def.key}
            className={cn(
              "rounded-lg border p-2.5 transition-colors",
              included ? "border-emerald-500/30 bg-emerald-500/5" : "bg-muted/20",
            )}
          >
            <div className="flex items-center gap-2">
              <Switch checked={included} onCheckedChange={(v) => toggleInclude(def.key, v)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{def.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{def.key}</p>
              </div>
            </div>

            {included && item ? (
              <div className="mt-2 space-y-2 pl-10">
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground">Question shown to the visitor</p>
                  <Input
                    className="h-7 text-xs"
                    value={item.label}
                    onChange={(e) => patch(def.key, { label: e.target.value })}
                    placeholder="e.g. Do you want to receive these emails?"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground">&ldquo;Yes&rdquo; option wording</p>
                  <Input
                    className="h-7 text-xs"
                    value={item.yesLabel ?? "Yes"}
                    onChange={(e) => patch(def.key, { yesLabel: e.target.value })}
                    placeholder='e.g. "Yes, I want these emails"'
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Renders as a required <b>Yes / No</b> dropdown — the visitor must answer.
                </p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function defaultLabel(name: string): string {
  return `I agree to ${name.toLowerCase()}.`;
}
