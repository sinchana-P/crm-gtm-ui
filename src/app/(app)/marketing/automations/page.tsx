"use client";

import { useState } from "react";
import { GitBranch, Play, Plus, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AUTOMATION_TEMPLATES, MOCK_AUTOMATIONS } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import { toast } from "sonner";

export default function AutomationsPage() {
  const [builderOpen, setBuilderOpen] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Automations"
        description="Trigger-based workflows: form submits, score changes, case events, and more."
        actions={
          <Button onClick={() => setBuilderOpen(true)}>
            <Plus className="mr-2 size-4" />
            New automation
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {AUTOMATION_TEMPLATES.map((t) => (
          <Card key={t.id} className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t.name}</CardTitle>
              <CardDescription className="text-xs">{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t.actions} actions
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success(`"${t.name}" automation created as draft`)}
              >
                Use template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Active automations</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                <TableHead className="text-right">Enrolled</TableHead>
                <TableHead>Last run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_AUTOMATIONS.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-muted-foreground">{a.trigger}</TableCell>
                  <TableCell>
                    <Badge
                      variant={a.status === "active" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{a.actions}</TableCell>
                  <TableCell className="text-right tabular-nums">{a.enrolled}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.lastRun ? formatRelative(a.lastRun) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Workflow builder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Card className="border-dashed shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <Zap className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Trigger</p>
                  <p className="text-xs text-muted-foreground">
                    When form is submitted → Demo Request
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Edit
                </Button>
              </CardContent>
            </Card>
            <div className="flex justify-center">
              <GitBranch className="size-4 text-muted-foreground" />
            </div>
            <Card className="border-dashed shadow-none">
              <CardContent className="flex items-center gap-3 p-4">
                <Play className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Action</p>
                  <p className="text-xs text-muted-foreground">
                    Enroll in sequence → New Lead Welcome
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Add action
                </Button>
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setBuilderOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Automation saved");
                  setBuilderOpen(false);
                }}
              >
                Save automation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
