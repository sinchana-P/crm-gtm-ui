"use client";

import { useState } from "react";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { InfoResponseDialog } from "@/components/portal/info-response-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPortalRequest } from "@/lib/mock-data/portal";
import { formatDateTime, formatRelative } from "@/lib/format";

export function PortalRequestDetail({ id }: { id: string }) {
  const request = getPortalRequest(id);
  const [infoOpen, setInfoOpen] = useState(false);

  if (!request) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold">Request not found</p>
        <ButtonLink href="/portal/requests" className="mt-4">Back to requests</ButtonLink>
      </div>
    );
  }

  const needsResponse =
    request.requiredFields &&
    request.requiredFields.length > 0 &&
    (request.status === "open" || request.status === "pending");

  return (
    <div className="space-y-6">
      <ButtonLink href="/portal/requests" variant="ghost" size="sm" className="-ml-2">
        <ChevronLeft className="size-4" />
        Requests
      </ButtonLink>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{request.title}</h1>
            <Badge variant="outline" className="font-mono">{request.number}</Badge>
            <Badge className="capitalize">{request.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{request.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {request.type} · Assigned to {request.assignee} · Opened {formatDateTime(request.createdAt)}
          </p>
        </div>
        {needsResponse ? <Button onClick={() => setInfoOpen(true)}>Respond to request</Button> : null}
      </div>

      {needsResponse ? (
        <Card className="border-primary/30 bg-muted/30 shadow-none">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Information requested</p>
              <p className="text-sm text-muted-foreground">Your rep needs additional details to proceed.</p>
            </div>
            <Button variant="outline" onClick={() => setInfoOpen(true)}>Provide details</Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-border pl-4">
              {request.timeline.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[1.35rem] top-1 size-2 rounded-full bg-foreground" />
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.body ? <p className="text-sm text-muted-foreground">{event.body}</p> : null}
                  <p className="text-xs text-muted-foreground">{event.actor} · {formatRelative(event.createdAt)}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Priority</p>
              <p className="font-medium capitalize">{request.priority}</p>
            </div>
            {request.slaDue ? (
              <div>
                <p className="text-muted-foreground">Response due</p>
                <p className="font-medium">{formatDateTime(request.slaDue)}</p>
              </div>
            ) : null}
            <Separator />
            <ButtonLink href="/portal/help" variant="outline" className="w-full">
              <MessageSquare className="size-4" />
              Contact support
            </ButtonLink>
          </CardContent>
        </Card>
      </div>

      <InfoResponseDialog request={request} open={infoOpen} onOpenChange={setInfoOpen} />
    </div>
  );
}
