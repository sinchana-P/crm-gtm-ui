"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsentRegister } from "@/components/settings/consent-register";
import { ConsentAiLadder } from "@/components/settings/consent-ai-ladder";
import { ConsentCaptureSources } from "@/components/settings/consent-capture-sources";
import { ConsentDurationPolicy } from "@/components/settings/consent-duration-policy";
import { CONSENT_CATALOG } from "@/lib/mock-data/consent-policy";

const totalConsents = CONSENT_CATALOG.length;
const toggleable = CONSENT_CATALOG.filter((d) => d.toggleable).length;

export default function SettingsConsentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent & privacy"
        description="The consent catalog, capture sources, AI/document permissions, and refresh policy applied across the workspace."
        actions={
          <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            Settings
          </Link>
        }
      />

      <Tabs defaultValue="register">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b bg-transparent">
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="data-ai">Data &amp; AI</TabsTrigger>
          <TabsTrigger value="capture">Capture &amp; proof</TabsTrigger>
          <TabsTrigger value="duration">Duration</TabsTrigger>
          <TabsTrigger value="preferences">Preference center</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            {totalConsents} consents across three categories — {toggleable} configurable, the rest
            tracked under another lawful basis. These defaults apply to new contacts unless
            overridden at capture.
          </p>
          <ConsentRegister />
        </TabsContent>

        <TabsContent value="data-ai" className="mt-4 space-y-4">
          <ConsentAiLadder />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Why the ladder is separate switches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Read / extract (OCR)</span> is reading
                what the customer gave you.{" "}
                <span className="font-medium text-foreground">AI inference</span> generates new
                derived output from it. A customer can allow the first and refuse the second, so
                they stay distinct rungs.
              </p>
              <p>
                <span className="font-medium text-foreground">AI training</span> is never bundled —
                it always requires its own explicit opt-in, and defaults to opt-out.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capture" className="mt-4">
          <ConsentCaptureSources />
        </TabsContent>

        <TabsContent value="duration" className="mt-4">
          <ConsentDurationPolicy />
        </TabsContent>

        <TabsContent value="preferences" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preference center</CardTitle>
              <CardDescription>
                Public page where contacts manage channel and topic preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-mono text-sm text-muted-foreground">
                  https://preferences.connect.example/c/your-workspace
                </p>
                <p className="text-xs text-muted-foreground">
                  Linked from email footers and WhatsApp opt-out flows.
                </p>
              </div>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className={buttonVariants({ variant: "outline" })}
              >
                <ExternalLink className="mr-2 size-4" />
                Preview preference center
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email topics &amp; suppression</CardTitle>
              <CardDescription>
                Topic-level subscriptions, marketable status, and the suppression list are managed
                in the Subscriptions module.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="/marketing/subscriptions"
                className={buttonVariants({ variant: "outline" })}
              >
                Open Subscriptions
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
