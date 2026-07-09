"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AiComposer } from "@/components/marketing/ai-email/ai-composer";
import { AiAgentPanel } from "@/components/marketing/ai-email/ai-agent-panel";
import { BrandVoicePanel } from "@/components/marketing/ai-email/brand-voice-panel";
import { NextActionsPanel } from "@/components/marketing/ai-email/next-actions-panel";

export function AiStudio() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Email Studio"
        description="Draft emails from a goal and audience, refine them section by section in your brand voice, and let AI suggest what to do next."
      />
      <Tabs defaultValue="composer">
        <TabsList>
          <TabsTrigger value="composer">Composer</TabsTrigger>
          <TabsTrigger value="brand">Brand voice</TabsTrigger>
          <TabsTrigger value="next">
            Next actions
            <Badge variant="outline" className="ml-1.5 border-0 bg-violet-500/10 text-violet-700 dark:text-violet-400">Phase 2</Badge>
          </TabsTrigger>
          <TabsTrigger value="agent">
            AI Agent
            <Badge variant="outline" className="ml-1.5 border-0 bg-blue-500/10 text-blue-700 dark:text-blue-400">Phase 3</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="composer" className="mt-6"><AiComposer /></TabsContent>
        <TabsContent value="brand" className="mt-6"><BrandVoicePanel /></TabsContent>
        <TabsContent value="next" className="mt-6"><NextActionsPanel /></TabsContent>
        <TabsContent value="agent" className="mt-6"><AiAgentPanel /></TabsContent>
      </Tabs>
    </div>
  );
}
