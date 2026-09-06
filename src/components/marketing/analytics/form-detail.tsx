"use client";

import { useState } from "react";
import { ArrowLeft, BarChart3, ListChecks, PenSquare, RefreshCw, Share2 } from "lucide-react";
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
import { FormBuilder } from "@/components/marketing/forms/form-builder";

interface Props {
  id: string;
}

/** Merged per-form detail: form responses + UTM analytics under one header. */
export function FormDetail({ id }: Props) {
  const [tab, setTab] = useState("build");
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

      <Tabs value={tab} onValueChange={(v) => setTab(v ?? "build")}>
        <TabsList>
          <TabsTrigger value="build">
            <PenSquare className="size-4" /> Build
          </TabsTrigger>
          <TabsTrigger value="responses">
            <ListChecks className="size-4" /> Responses
          </TabsTrigger>
          <TabsTrigger value="utm">
            <BarChart3 className="size-4" /> UTM Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="build" className="mt-6">
          {form ? (
            <FormBuilder form={form} />
          ) : (
            <p className="text-sm text-muted-foreground">Form not found.</p>
          )}
        </TabsContent>
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
