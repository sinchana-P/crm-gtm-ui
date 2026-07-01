"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { MOCK_CASE_TEMPLATES } from "@/lib/mock-data";
import type { CaseTemplate } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export default function CaseTemplatesPage() {
  const [templates, setTemplates] = useState(MOCK_CASE_TEMPLATES);
  const [editing, setEditing] = useState<CaseTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function openCreate() {
    setEditing({
      id: `ct-new-${Date.now()}`,
      name: "",
      type: "",
      description: "",
      defaultPriority: "medium",
      defaultAssignee: "",
      slaHours: 48,
      fieldMappings: [{ templateField: "", contactField: "" }],
      active: true,
    });
    setDialogOpen(true);
  }

  function openEdit(t: CaseTemplate) {
    setEditing({ ...t });
    setDialogOpen(true);
  }

  function saveTemplate() {
    if (!editing?.name.trim()) return;
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === editing.id);
      return exists ? prev.map((t) => (t.id === editing.id ? editing : t)) : [...prev, editing];
    });
    toast.success("Template saved");
    setDialogOpen(false);
    setEditing(null);
  }

  function deleteTemplate(id: string) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template removed");
  }

  function toggleActive(id: string) {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t))
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Case templates"
        description="Intake templates with field mapping to contact records for two-click case creation."
        actions={
          <>
            <Link href="/cases" className={buttonVariants({ variant: "outline" })}>
              <ArrowLeft className="mr-2 size-4" />
              Cases
            </Link>
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              New template
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Templates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Field mappings</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>{t.type}</TableCell>
                  <TableCell>{t.slaHours}h</TableCell>
                  <TableCell>{t.defaultAssignee}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t.fieldMappings.length} fields</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={t.active} onCheckedChange={() => toggleActive(t.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(t)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteTemplate(t.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.name ? "Edit template" : "New template"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Case type</Label>
                  <Input
                    value={editing.type}
                    onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact field mappings</Label>
                {editing.fieldMappings.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Template field"
                      value={m.templateField}
                      onChange={(e) => {
                        const mappings = [...editing.fieldMappings];
                        mappings[i] = { ...m, templateField: e.target.value };
                        setEditing({ ...editing, fieldMappings: mappings });
                      }}
                    />
                    <Input
                      placeholder="Contact field"
                      value={m.contactField}
                      onChange={(e) => {
                        const mappings = [...editing.fieldMappings];
                        mappings[i] = { ...m, contactField: e.target.value };
                        setEditing({ ...editing, fieldMappings: mappings });
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      fieldMappings: [...editing.fieldMappings, { templateField: "", contactField: "" }],
                    })
                  }
                >
                  Add mapping
                </Button>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={saveTemplate}>Save template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
