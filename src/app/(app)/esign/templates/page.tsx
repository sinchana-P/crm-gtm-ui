"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { MOCK_ESIGN_TEMPLATES } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";
import type { EsignTemplate } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";

export default function EsignTemplatesPage() {
  const [templates, setTemplates] = useState(MOCK_ESIGN_TEMPLATES);
  const [editing, setEditing] = useState<EsignTemplate | null>(null);
  const [open, setOpen] = useState(false);

  function save() {
    if (!editing?.name.trim()) return;
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === editing.id);
      return exists ? prev.map((t) => (t.id === editing.id ? editing : t)) : [...prev, editing];
    });
    toast.success("Template saved");
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sign templates"
        description="Document templates with CRM field mapping for auto-filled agreements."
        actions={
          <>
            <Link href="/esign" className={buttonVariants({ variant: "outline" })}>
              <ArrowLeft className="mr-2 size-4" />
              E-sign
            </Link>
            <Button
              onClick={() => {
                setEditing({
                  id: `et-${Date.now()}`,
                  name: "",
                  category: "",
                  description: "",
                  fields: [{ label: "", crmField: "" }],
                  active: true,
                });
                setOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" />
              New template
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{t.name}</p>
                  <Badge variant="secondary" className="mt-1">
                    {t.category}
                  </Badge>
                </div>
                <Switch
                  checked={t.active}
                  onCheckedChange={() =>
                    setTemplates((prev) =>
                      prev.map((x) => (x.id === t.id ? { ...x, active: !x.active } : x))
                    )
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">CRM field mapping</p>
                {t.fields.map((f) => (
                  <div key={f.label} className="flex justify-between text-xs">
                    <span>{f.label}</span>
                    <span className="font-mono text-muted-foreground">{f.crmField}</span>
                  </div>
                ))}
              </div>
              {t.lastUsed ? (
                <p className="text-xs text-muted-foreground">Last used {formatDate(t.lastUsed)}</p>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setEditing({ ...t });
                  setOpen(true);
                }}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit sign template</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Field mappings</Label>
                {editing.fields.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Document field"
                      value={f.label}
                      onChange={(e) => {
                        const fields = [...editing.fields];
                        fields[i] = { ...f, label: e.target.value };
                        setEditing({ ...editing, fields });
                      }}
                    />
                    <Input
                      placeholder="CRM field"
                      value={f.crmField}
                      onChange={(e) => {
                        const fields = [...editing.fields];
                        fields[i] = { ...f, crmField: e.target.value };
                        setEditing({ ...editing, fields });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
