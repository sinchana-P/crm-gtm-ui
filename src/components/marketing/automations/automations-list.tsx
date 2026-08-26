"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GitBranch, Plus, Sparkles, Waypoints, Workflow, Zap } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { catalogItem, SAMPLE_WORKFLOWS, WORKFLOW_PACKS } from "@/lib/mock-data/automations";
import { cn } from "@/lib/utils";

export function AutomationsList() {
  const router = useRouter();
  const [tab, setTab] = useState("workflows");
  const active = SAMPLE_WORKFLOWS.filter((w) => w.enabled).length;
  const runs = SAMPLE_WORKFLOWS.reduce((s, w) => s + w.runs, 0);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Automations"
        description="Rule-based, system-run workflows that trigger on events across the CRM and run actions on your records — automatically, at scale."
        actions={
          <>
            <Button variant="outline" render={<Link href="/marketing/sequences" />}><Waypoints className="size-4" /> Sequences</Button>
            <Button onClick={() => router.push("/marketing/automations/new")}><Plus className="size-4" /> New workflow</Button>
          </>
        }
      />

      {/* Automation ↔ Sequences relationship */}
      <Card className="border-violet-500/30 bg-gradient-to-r from-violet-500/5 to-transparent shadow-none">
        <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white"><Workflow className="size-4.5" /></span>
            <div>
              <p className="text-sm font-semibold">Automations</p>
              <p className="text-xs text-muted-foreground">System · bulk · rule-based</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="hidden text-xs lg:inline">hand off via</span>
            <Badge variant="secondary" className="gap-1 bg-violet-500/10 text-violet-600"><Waypoints className="size-3" /> Enroll in Sequence</Badge>
            <ArrowRight className="size-4" />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-violet-600 text-white"><Waypoints className="size-4.5" /></span>
            <div>
              <p className="text-sm font-semibold">Sequences</p>
              <p className="text-xs text-muted-foreground">Rep · 1:1 · pause-on-reply</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground lg:ml-4 lg:max-w-md">
            Use them <span className="font-medium text-foreground">independently</span> — or <span className="font-medium text-foreground">linked</span>: a workflow can drop a qualified record into a rep&apos;s sequence, and a sequence goal (reply / meeting) can enroll the record back into a workflow.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Active workflows" value={active} icon={Zap} subtitle={`${SAMPLE_WORKFLOWS.length} total`} />
        <StatCard title="Records processed" value={runs.toLocaleString()} icon={Workflow} trend={{ value: "+12%", positive: true }} />
        <StatCard title="Prebuilt packs" value={WORKFLOW_PACKS.length} icon={Sparkles} subtitle="Start in seconds" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="packs">Prebuilt packs</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="mt-4 space-y-2">
          {SAMPLE_WORKFLOWS.map((w) => {
            const t = catalogItem(w.triggerType);
            const Icon = t?.icon ?? Zap;
            return (
              <Link key={w.id} href={`/marketing/automations/${w.id}`} className="flex items-center gap-4 rounded-lg border p-3.5 transition-colors hover:border-primary hover:bg-primary/5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600"><Icon className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{w.name}</p>
                    <Badge variant="outline" className="capitalize">{w.object}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">When: {t?.label} · {w.runs.toLocaleString()} runs · updated {w.updated}</p>
                </div>
                <span className={cn("flex items-center gap-1.5 text-xs", w.enabled ? "text-emerald-600" : "text-muted-foreground")}>
                  <span className={cn("size-1.5 rounded-full", w.enabled ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                  {w.enabled ? "Active" : "Paused"}
                </span>
              </Link>
            );
          })}
        </TabsContent>

        <TabsContent value="packs" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WORKFLOW_PACKS.map((p) => {
              const t = catalogItem(p.triggerType);
              const Icon = t?.icon ?? GitBranch;
              return (
                <Card key={p.key} className="shadow-none transition-colors hover:border-primary">
                  <CardContent className="space-y-3 py-4">
                    <div className="flex items-center justify-between">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground/70"><Icon className="size-4.5" /></span>
                      <Badge variant="outline" className="capitalize">{p.object}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{p.steps} steps</span>
                      <Button size="sm" variant="outline" onClick={() => { toast.success(`Cloned “${p.name}”`); router.push("/marketing/automations/new"); }}>Use pack</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
