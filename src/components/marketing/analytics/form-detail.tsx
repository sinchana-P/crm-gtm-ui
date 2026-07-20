"use client";

import { useState } from "react";
import { ArrowLeft, BarChart3, ListChecks, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFormUtmData, MOCK_FORMS } from "@/lib/mock-data";
import { ShareFormDialog } from "./share-form-dialog";
import { FormResponses } from "./form-responses";
import { FormUtmDashboard } from "./form-utm-dashboard";

interface Props {
  id: string;
}

/** Merged per-form detail: form responses + UTM analytics under one header. */
export function FormDetail({ id }: Props) {
  const [tab, setTab] = useState("responses");
  const [shareOpen, setShareOpen] = useState(false);

  const form = MOCK_FORMS.find((f) => f.id === id);
  const data = getFormUtmData(id);
  const name = form?.name ?? data.formName;
  const s = data.summary;

  return (
    <div className="space-y-6">
      <PageHeader
        title={name}
        description="Responses and UTM attribution for this form — who came from where, and how they converted."
        actions={
          <div className="flex items-center gap-2">
            <ButtonLink href="/marketing/forms" variant="outline">
              <ArrowLeft className="size-4" /> Back to forms
            </ButtonLink>
            <Button variant="outline" size="icon" onClick={() => toast.success("Refreshed")} aria-label="Refresh">
              <RefreshCw className="size-4" />
            </Button>
            <Button onClick={() => setShareOpen(true)}>
              <Share2 className="size-4" /> Share &amp; get link
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline" className="border-0 bg-emerald-500/10 capitalize text-emerald-700 dark:text-emerald-400">
          {form?.status ?? "published"}
        </Badge>
        <span className="text-muted-foreground">
          {s.views.toLocaleString()} views · {s.submissions} submissions · {s.submissionRate}% submission rate
        </span>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v ?? "responses")}>
        <TabsList>
          <TabsTrigger value="responses">
            <ListChecks className="size-4" /> Responses
          </TabsTrigger>
          <TabsTrigger value="utm">
            <BarChart3 className="size-4" /> UTM Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="responses" className="mt-6">
          <FormResponses data={data} />
        </TabsContent>
        <TabsContent value="utm" className="mt-6">
          <FormUtmDashboard data={data} />
        </TabsContent>
      </Tabs>

      <ShareFormDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        formName={name}
        baseUrl={data.shareBaseUrl}
      />
    </div>
  );
}
