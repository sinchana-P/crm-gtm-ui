import {
  Cookie,
  Database,
  Mail,
  Monitor,
  MessageSquare,
  PenLine,
  Phone,
  PhoneCall,
  SquareCheckBig,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CAPTURE_SOURCES,
  PROOF_STRENGTH_LABEL,
  type ProofStrength,
} from "@/lib/mock-data/consent-policy";

const ICONS: Record<string, LucideIcon> = {
  monitor: Monitor,
  mail: Mail,
  "square-check-big": SquareCheckBig,
  "message-square": MessageSquare,
  "pen-line": PenLine,
  upload: Upload,
  "phone-call": PhoneCall,
  cookie: Cookie,
  phone: Phone,
  database: Database,
};

const STRENGTH_STYLES: Record<ProofStrength, string> = {
  strong:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "confirm-required":
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  risky: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

export function ConsentCaptureSources() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Capture sources &amp; proof</CardTitle>
        <CardDescription>
          Where consent is collected, and the evidence stored for each. The channel doesn&apos;t
          matter — the proof does.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {CAPTURE_SOURCES.map((source) => {
          const Icon = ICONS[source.icon] ?? Monitor;
          return (
            <div
              key={source.id}
              className="flex gap-3 rounded-lg border p-3"
            >
              <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-4.5" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{source.name}</p>
                  <Badge
                    variant="outline"
                    className={cn("flex-none text-[11px]", STRENGTH_STYLES[source.strength])}
                  >
                    {PROOF_STRENGTH_LABEL[source.strength]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{source.how}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{source.proof}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
