"use client";

import Link from "next/link";
import { ArrowLeft, LayoutGrid, ShieldAlert, Users } from "lucide-react";
import { getCmProjectById, CM_QUEUES } from "@/lib/mock-data/case-manager";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { CaseBoard } from "@/components/case-manager/case-board";
import { CmCaseList } from "@/components/case-manager/cm-case-list";
import { AutomationsBuilder } from "@/components/case-manager/automations-builder";
import { ProjectStatusBadge } from "@/components/case-manager/cm-status-badges";

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const project = getCmProjectById(projectId);
  const cases = useCaseManagerStore((s) => s.cases);

  if (!project) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Project not found"
        description="This project may have been archived or does not exist."
        action={<Link href="/case-manager/projects" className="text-sm font-medium text-primary hover:underline">Back to projects</Link>}
      />
    );
  }

  const projectCases = cases.filter((c) => c.projectId === projectId);
  const open = projectCases.filter((c) => !["Resolved", "Closed"].includes(c.status)).length;
  const queues = CM_QUEUES.filter((q) => q.projectId === projectId);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Link href="/case-manager/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Projects
        </Link>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{project.displayId}</span>
              <ProjectStatusBadge status={project.status} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">{project.description}</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            Lead: <span className="font-medium text-foreground">{project.lead}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="board">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b bg-transparent">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="queues">Queues</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Open cases" value={open} icon={LayoutGrid} />
            <StatCard title="Total cases" value={project.totalCases} />
            <StatCard title="Overdue" value={project.overdueCases} />
            <StatCard title="SLA compliance" value={`${project.slaCompliance}%`} />
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">SLA compliance</CardTitle></CardHeader>
            <CardContent>
              <Progress value={project.slaCompliance} className="h-2" />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.crmCaseTypes.map((t) => (
                  <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board" className="mt-4">
          <CaseBoard projectId={projectId} />
        </TabsContent>

        <TabsContent value="cases" className="mt-4">
          <CmCaseList
            baseHref="/case-manager/cases"
            filter={(c) => c.projectId === projectId}
            emptyLabel="No cases in this project"
          />
        </TabsContent>

        <TabsContent value="queues" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Queue</TableHead>
                    <TableHead>Open</TableHead>
                    <TableHead>SLA breaches</TableHead>
                    <TableHead>Avg resolution</TableHead>
                    <TableHead>Members</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queues.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.name}</TableCell>
                      <TableCell className="tabular-nums">{q.openCases}</TableCell>
                      <TableCell>
                        {q.slaBreaches > 0 ? (
                          <Badge variant="outline" className="border-red-500/30 text-red-600">{q.slaBreaches}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{q.avgResolutionHrs}h</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{q.members.join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="mt-4">
          <AutomationsBuilder projectId={projectId} />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {project.team.map((member) => (
              <Card key={member}>
                <CardContent className="flex items-center gap-3 py-4">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                      {member.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member}</p>
                    <p className="text-xs text-muted-foreground">
                      {member === project.lead ? "Project lead" : "Member"}
                    </p>
                  </div>
                  <Users className="ml-auto size-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
