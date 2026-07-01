"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { IMPORT_FIELD_OPTIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STEPS = ["Upload", "Map fields", "Quality report", "Confirm"];

const CSV_COLUMNS = ["first_name", "last_name", "email_address", "mobile", "org"];

export default function ImportPage() {
  const [step, setStep] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [mappings, setMappings] = useState<Record<string, string>>({
    first_name: "First Name",
    last_name: "Last Name",
    email_address: "Email",
    mobile: "Phone",
    org: "Company",
  });

  const qualityReport = {
    total: 1240,
    valid: 1186,
    duplicates: 38,
    missingEmail: 16,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import contacts"
        description="Upload a CSV, map columns, review quality, and confirm import."
      />

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                i <= step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                i <= step ? "font-medium" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 ? (
              <div className="hidden h-px flex-1 bg-border sm:block" />
            ) : null}
          </div>
        ))}
      </div>
      <Progress value={((step + 1) / STEPS.length) * 100} className="h-1" />

      {step === 0 ? (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Upload file</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Upload className="size-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Drag and drop a CSV or Excel file, or browse to upload.
            </p>
            <Button
              onClick={() => {
                setUploaded(true);
                setStep(1);
              }}
            >
              <FileSpreadsheet className="size-4" />
              Select file
            </Button>
            {uploaded ? (
              <p className="text-sm font-medium">contacts_import_june.csv</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Map fields</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CSV column</TableHead>
                  <TableHead>CRM field</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CSV_COLUMNS.map((col) => (
                  <TableRow key={col}>
                    <TableCell className="font-mono text-sm">{col}</TableCell>
                    <TableCell>
                      <Select
                        value={mappings[col]}
                        onValueChange={(v) =>
                          setMappings((m) => ({ ...m, [col]: v ?? "" }))
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMPORT_FIELD_OPTIONS.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valid rows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{qualityReport.valid}</p>
              <p className="text-xs text-muted-foreground">
                of {qualityReport.total} total
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="size-4 text-amber-600" />
                Duplicates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{qualityReport.duplicates}</p>
              <p className="text-xs text-muted-foreground">Will skip on import</p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="size-4 text-destructive" />
                Missing email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {qualityReport.missingEmail}
              </p>
              <p className="text-xs text-muted-foreground">Requires review</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {step === 3 ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <CheckCircle2 className="size-12 text-emerald-600" />
            <div>
              <p className="text-lg font-medium">Ready to import</p>
              <p className="text-sm text-muted-foreground">
                {qualityReport.valid} contacts will be created.{" "}
                {qualityReport.duplicates} duplicates skipped.
              </p>
            </div>
            <Badge variant="secondary">Import queued</Badge>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !uploaded}>
            Continue
          </Button>
        ) : (
          <Button onClick={() => setStep(0)}>Start new import</Button>
        )}
      </div>
    </div>
  );
}
