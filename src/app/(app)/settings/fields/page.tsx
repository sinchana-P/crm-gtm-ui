"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, GripVertical, Plus } from "lucide-react";
import { MOCK_CUSTOM_FIELDS } from "@/lib/mock-data";
import type { CustomField } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const objectTypes: CustomField["objectType"][] = ["contact", "lead", "case", "deal"];

export default function SettingsFieldsPage() {
  const [fields, setFields] = useState(MOCK_CUSTOM_FIELDS);
  const [activeObject, setActiveObject] = useState<CustomField["objectType"]>("contact");

  const visibleFields = fields.filter((f) => f.objectType === activeObject && f.visible);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom fields"
        description="Define fields per object and preview the record layout."
        actions={
          <Link href="/settings" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="mr-2 size-4" />
            Settings
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Field definitions</CardTitle>
              <CardDescription>API names and types for each object.</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="mr-2 size-4" />
              Add field
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={activeObject} onValueChange={(v) => setActiveObject(v as CustomField["objectType"])}>
              <TabsList className="mb-4">
                {objectTypes.map((t) => (
                  <TabsTrigger key={t} value={t} className="capitalize">
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>
              {objectTypes.map((t) => (
                <TabsContent key={t} value={t}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>API name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Visible</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields
                        .filter((f) => f.objectType === t)
                        .map((f) => (
                          <TableRow key={f.id}>
                            <TableCell className="font-medium">{f.label}</TableCell>
                            <TableCell className="font-mono text-xs">{f.apiName}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize font-normal">
                                {f.fieldType}
                              </Badge>
                            </TableCell>
                            <TableCell>{f.required ? "Yes" : "No"}</TableCell>
                            <TableCell>
                              <Switch
                                checked={f.visible}
                                onCheckedChange={() =>
                                  setFields((prev) =>
                                    prev.map((x) =>
                                      x.id === f.id ? { ...x, visible: !x.visible } : x
                                    )
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Layout preview</CardTitle>
            <CardDescription>
              Visible fields on the {activeObject} record detail view.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <p className="text-sm font-medium capitalize">{activeObject} record</p>
              <div className="space-y-2">
                <LayoutRow label="Name" value="Sample record" />
                <LayoutRow label="Email" value="sample@company.in" />
                {visibleFields.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 group">
                    <GripVertical className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    <LayoutRow
                      label={f.label}
                      value={f.fieldType === "boolean" ? "No" : "—"}
                      required={f.required}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LayoutRow({
  label,
  value,
  required,
}: {
  label: string;
  value: string;
  required?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm border-b border-dashed pb-2 last:border-0">
      <span className="text-muted-foreground">
        {label}
        {required ? <span className="text-destructive ml-0.5">*</span> : null}
      </span>
      <span>{value}</span>
    </div>
  );
}
