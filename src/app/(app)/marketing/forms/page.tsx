"use client";

import { useState } from "react";
import { BarChart3, Copy, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_FORMS, MOCK_SEQUENCES } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

const EMBED_CODE = `<script src="https://forms.connectcrm.in/embed.js" data-form="f1"></script>
<div id="connect-form-f1"></div>`;

export default function FormsPage() {
  const [selectedId, setSelectedId] = useState(MOCK_FORMS[0].id);
  const [recaptcha, setRecaptcha] = useState(MOCK_FORMS[0].recaptchaEnabled);
  const [recoverySequence, setRecoverySequence] = useState(
    MOCK_FORMS[0].abandonmentRecoverySequenceId ?? ""
  );

  const selected = MOCK_FORMS.find((f) => f.id === selectedId) ?? MOCK_FORMS[0];

  function copyEmbed() {
    navigator.clipboard.writeText(EMBED_CODE);
    toast.success("Embed code copied to clipboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forms"
        description="Capture leads with multi-step forms, embed codes, and abandonment recovery."
        actions={
          <Button>
            <Plus className="mr-2 size-4" />
            New form
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">All forms</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form</TableHead>
                  <TableHead className="text-right">Submissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_FORMS.map((f) => (
                  <TableRow
                    key={f.id}
                    className="cursor-pointer"
                    data-state={f.id === selectedId ? "selected" : undefined}
                    onClick={() => {
                      setSelectedId(f.id);
                      setRecaptcha(f.recaptchaEnabled);
                      setRecoverySequence(f.abandonmentRecoverySequenceId ?? "");
                    }}
                  >
                    <TableCell>
                      <p className="font-medium">{f.name}</p>
                      <Badge variant="outline" className="mt-1 capitalize">
                        {f.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="flex items-center justify-end gap-1">
                        <span>{f.submissions.toLocaleString()}</span>
                        {f.status === "published" && (
                          <ButtonLink
                            href={`/marketing/forms/${f.id}`}
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`UTM analytics for ${f.name}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <BarChart3 className="size-4 text-muted-foreground" />
                          </ButtonLink>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{selected.name}</CardTitle>
            {selected.status === "published" && (
              <ButtonLink
                href={`/marketing/forms/${selected.id}`}
                variant="outline"
                size="sm"
              >
                <BarChart3 className="mr-2 size-4" />
                View UTM analytics
              </ButtonLink>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="step1">
              <TabsList>
                <TabsTrigger value="step1">Step 1 — Contact</TabsTrigger>
                <TabsTrigger value="step2">Step 2 — Company</TabsTrigger>
                <TabsTrigger value="step3">Step 3 — Preferences</TabsTrigger>
              </TabsList>
              <TabsContent value="step1" className="mt-4 space-y-3">
                <div className="grid gap-2">
                  <Label>First name</Label>
                  <Input placeholder="Required" disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Required" disabled />
                </div>
              </TabsContent>
              <TabsContent value="step2" className="mt-4 space-y-3">
                <div className="grid gap-2">
                  <Label>Company</Label>
                  <Input placeholder="Optional" disabled />
                </div>
                <div className="grid gap-2">
                  <Label>Job title</Label>
                  <Input placeholder="Optional" disabled />
                </div>
              </TabsContent>
              <TabsContent value="step3" className="mt-4 space-y-3">
                <div className="grid gap-2">
                  <Label>Product interest</Label>
                  <Input placeholder="Picklist" disabled />
                </div>
                <div className="flex items-center gap-2">
                  <Switch disabled defaultChecked />
                  <Label>Marketing consent</Label>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
              <div className="flex items-center justify-between sm:flex-col sm:items-start sm:gap-2">
                <div>
                  <p className="text-sm font-medium">reCAPTCHA</p>
                  <p className="text-xs text-muted-foreground">Block bot submissions</p>
                </div>
                <Switch checked={recaptcha} onCheckedChange={setRecaptcha} />
              </div>
              <div className="space-y-2">
                <Label>Abandonment recovery</Label>
                <Select
                  value={recoverySequence}
                  onValueChange={(v) => setRecoverySequence(v ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Link to sequence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {MOCK_SEQUENCES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {recoverySequence && (
                  <ButtonLink
                    href={`/marketing/sequences/${recoverySequence}`}
                    variant="link"
                    className="h-auto p-0"
                  >
                    <ExternalLink className="mr-1 size-3" />
                    Open sequence
                  </ButtonLink>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Embed code</Label>
                <Button variant="outline" size="sm" onClick={copyEmbed}>
                  <Copy className="mr-2 size-4" />
                  Copy
                </Button>
              </div>
              <Textarea
                readOnly
                value={EMBED_CODE}
                className="font-mono text-xs"
                rows={3}
              />
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{selected.conversionRate}% conversion</span>
              <span>Updated {formatDate(selected.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
