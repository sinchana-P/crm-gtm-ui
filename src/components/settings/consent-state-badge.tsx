import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CONSENT_STATE_LABEL,
  type ConsentState,
} from "@/lib/mock-data/consent-policy";

/** A contact-level consent state can additionally be "provisional" (verbal, awaiting confirm). */
export type DisplayConsentState = ConsentState | "provisional";

const STATE_STYLES: Record<DisplayConsentState, string> = {
  "opt-in":
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  neutral:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "opt-out":
    "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  provisional:
    "border-violet-500/40 border-dashed bg-violet-500/10 text-violet-700 dark:text-violet-400",
};

const DOT_STYLES: Record<DisplayConsentState, string> = {
  "opt-in": "bg-emerald-500",
  neutral: "bg-amber-500",
  "opt-out": "bg-red-500",
  provisional: "bg-violet-500",
};

const STATE_LABEL: Record<DisplayConsentState, string> = {
  ...CONSENT_STATE_LABEL,
  provisional: "Provisional",
};

export function ConsentStateBadge({
  state,
  className,
}: {
  state: DisplayConsentState;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", STATE_STYLES[state], className)}
    >
      <span className={cn("size-1.5 rounded-full", DOT_STYLES[state])} />
      {STATE_LABEL[state]}
    </Badge>
  );
}
