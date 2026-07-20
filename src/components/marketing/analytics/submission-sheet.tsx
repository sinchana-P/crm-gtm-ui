"use client";

import { Link2Off, Monitor, Smartphone, Tablet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatDateTime } from "@/lib/format";
import { formatDuration } from "@/lib/marketing/utm-analytics";
import { type FormUtmSubmission } from "@/lib/mock-data";

const DEVICE_ICON = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };

interface Props {
  submission: FormUtmSubmission | null;
  onClose: () => void;
}

/** Shared respondent detail drawer used by the Responses and UTM tabs. */
export function SubmissionSheet({ submission, onClose }: Props) {
  const DeviceIcon = submission ? DEVICE_ICON[submission.device] : Monitor;

  return (
    <Sheet open={!!submission} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md">
        {submission && (
          <>
            <SheetHeader>
              <SheetTitle>{submission.name}</SheetTitle>
              <SheetDescription>{submission.email}</SheetDescription>
            </SheetHeader>
            <div className="space-y-5 overflow-y-auto px-4 pb-6">
              {submission.source ? (
                <Badge
                  variant="outline"
                  className="border-0 bg-primary/10 text-primary capitalize"
                >
                  {submission.firstTouch ? "First-touch" : "Last-touch"} ·{" "}
                  {submission.source}
                </Badge>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-muted-foreground/20 bg-muted/40 p-3 text-sm">
                  <Link2Off className="size-4 text-muted-foreground" />
                  <span>Direct visit — arrived on the bare form URL with no UTM parameters.</span>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  UTM attribution
                </p>
                <dl className="grid grid-cols-3 gap-x-3 gap-y-3 text-sm">
                  {[
                    ["utm_source", submission.source],
                    ["utm_medium", submission.medium],
                    ["utm_campaign", submission.campaign],
                    ["utm_content", submission.content],
                    ["utm_term", submission.term],
                  ].map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="font-mono text-muted-foreground">{label}</dt>
                      <dd className="col-span-2 font-medium break-words">
                        {value ?? <span className="text-muted-foreground">—</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Session
                </p>
                <dl className="grid grid-cols-3 gap-x-3 gap-y-3 text-sm">
                  <dt className="text-muted-foreground">Device</dt>
                  <dd className="col-span-2 flex items-center gap-1.5 font-medium capitalize">
                    <DeviceIcon className="size-3.5" /> {submission.device}
                  </dd>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="col-span-2 font-medium">
                    {submission.city}, {submission.country}
                  </dd>
                  <dt className="text-muted-foreground">Referrer</dt>
                  <dd className="col-span-2 font-medium break-words">{submission.referrer}</dd>
                  <dt className="text-muted-foreground">Time to submit</dt>
                  <dd className="col-span-2 font-medium">
                    {formatDuration(submission.timeToSubmitSec)}
                  </dd>
                  <dt className="text-muted-foreground">Submitted</dt>
                  <dd className="col-span-2 font-medium">{formatDateTime(submission.submittedAt)}</dd>
                </dl>
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">Landing URL</p>
                <code className="block rounded-md bg-muted p-2 text-xs break-all">
                  {submission.landingUrl}
                </code>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
