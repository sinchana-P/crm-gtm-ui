"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Users } from "lucide-react";
import { toast } from "sonner";
import { MOCK_CONTACTS, MOCK_ESIGN_TEMPLATES, MOCK_LISTS } from "@/lib/mock-data";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const steps = ["Pick template", "Pick list", "Review signers"] as const;

export default function EsignBulkPage() {
  const [step, setStep] = useState(0);
  const [templateId, setTemplateId] = useState("");
  const [listId, setListId] = useState("");

  const template = MOCK_ESIGN_TEMPLATES.find((t) => t.id === templateId);
  const list = MOCK_LISTS.find((l) => l.id === listId);
  const previewSigners = MOCK_CONTACTS.slice(0, Math.min(5, list?.count ?? 0));

  function handleSend() {
    toast.success("Bulk send queued", {
      description: `${list?.count ?? 0} envelopes will be sent using ${template?.name}.`,
    });
    setStep(0);
    setTemplateId("");
    setListId("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk send"
        description="Send agreements to a list or segment in three steps."
        actions={
          <Link href="/esign" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            E-sign
          </Link>
        }
      />

      <div className="flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <Badge variant={step >= i ? "default" : "secondary"} className="gap-1">
              {step > i ? <Check className="size-3" /> : i + 1}
              {label}
            </Badge>
            {i < steps.length - 1 ? <ArrowRight className="size-4 text-muted-foreground" /> : null}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select template</CardTitle>
            <CardDescription>Choose the agreement template for this bulk send.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Sign template</Label>
              <Select value={templateId} onValueChange={(v) => setTemplateId(v ?? "")}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ESIGN_TEMPLATES.filter((t) => t.active).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {template ? (
              <p className="text-sm text-muted-foreground">{template.description}</p>
            ) : null}
            <Button disabled={!templateId} onClick={() => setStep(1)}>
              Continue
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select list or segment</CardTitle>
            <CardDescription>Recipients are drawn from the selected audience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>List / segment</Label>
              <Select value={listId} onValueChange={(v) => setListId(v ?? "")}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select list" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_LISTS.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name} ({l.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {list ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                {list.count} recipients · {list.type} list
              </div>
            ) : null}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button disabled={!listId} onClick={() => setStep(2)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review signers</CardTitle>
            <CardDescription>
              Preview of first {previewSigners.length} signers from {list?.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewSigners.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {c.firstName} {c.lastName}
                    </TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.company ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {list && list.count > previewSigners.length ? (
              <p className="text-sm text-muted-foreground">
                + {list.count - previewSigners.length} more recipients
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSend}>Send {list?.count ?? 0} envelopes</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
