"use client";

import { useState } from "react";
import { Copy, Plus, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_EMAIL_TEMPLATES, TEMPLATE_PLACEHOLDERS } from "@/lib/mock-data";
import { formatRelative } from "@/lib/format";
import { toast } from "sonner";

export default function EmailTemplatesPage() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [subject, setSubject] = useState("Welcome to Connect, {{firstName}}");
  const [body, setBody] = useState(
    "Hi {{firstName}},\n\nThank you for your interest in Connect CRM..."
  );

  const sorted = [...MOCK_EMAIL_TEMPLATES].sort((a, b) => b.openRate - a.openRate);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Email Templates"
        description="Reusable templates with merge fields and performance tracking."
        actions={
          <Button onClick={() => setEditorOpen(true)}>
            <Plus className="mr-2 size-4" />
            New template
          </Button>
        }
      />

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4" />
            Performance leaderboard (90 days)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Open %</TableHead>
                <TableHead className="text-right">Click %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((t, i) => (
                <TableRow key={t.id}>
                  <TableCell className="tabular-nums text-muted-foreground">
                    #{i + 1}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      className="text-left font-medium hover:underline"
                      onClick={() => {
                        setSubject(t.subject);
                        setEditorOpen(true);
                      }}
                    >
                      {t.name}
                    </button>
                    <p className="text-xs text-muted-foreground">{t.subject}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{t.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {t.sent.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{t.openRate}%</TableCell>
                  <TableCell className="text-right tabular-nums">{t.clickRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Template editor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  rows={12}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditorOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    toast.success("Template saved");
                    setEditorOpen(false);
                  }}
                >
                  Save template
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Placeholders</Label>
              <div className="flex flex-col gap-1">
                {TEMPLATE_PLACEHOLDERS.map((ph) => (
                  <Button
                    key={ph}
                    variant="outline"
                    size="sm"
                    className="justify-between font-mono text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(ph);
                      toast.message(`Copied ${ph}`);
                    }}
                  >
                    {ph}
                    <Copy className="size-3" />
                  </Button>
                ))}
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                Updated {formatRelative(MOCK_EMAIL_TEMPLATES[0].updatedAt)}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
