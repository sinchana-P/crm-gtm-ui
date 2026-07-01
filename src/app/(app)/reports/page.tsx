"use client";

import { useMemo, useState } from "react";
import { BarChart3, Play } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  MOCK_CONTACTS,
  REPORT_DIMENSIONS,
  REPORT_OBJECTS,
} from "@/lib/mock-data";

export default function ReportsPage() {
  const [objectType, setObjectType] = useState("Contacts");
  const [dimensions, setDimensions] = useState<string[]>(["Owner", "Source"]);
  const [preview, setPreview] = useState(false);

  const previewData = useMemo(() => {
    if (!preview) return [];
    const grouped = new Map<string, number>();
    MOCK_CONTACTS.forEach((c) => {
      const key = `${c.owner} · ${c.source}`;
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
    });
    return Array.from(grouped.entries()).map(([key, count]) => {
      const [owner, source] = key.split(" · ");
      return { owner, source, count };
    });
  }, [preview]);

  const toggleDimension = (dim: string, checked: boolean) => {
    setDimensions((prev) =>
      checked ? [...prev, dim] : prev.filter((d) => d !== dim)
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Build lightweight reports by object and dimensions."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Report builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Object</Label>
              <Select value={objectType} onValueChange={(v) => setObjectType(v ?? "Contacts")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_OBJECTS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Dimensions</Label>
              {REPORT_DIMENSIONS.map((dim) => (
                <div key={dim} className="flex items-center gap-2">
                  <Checkbox
                    id={dim}
                    checked={dimensions.includes(dim)}
                    onCheckedChange={(v) => toggleDimension(dim, !!v)}
                  />
                  <Label htmlFor={dim} className="font-normal">
                    {dim}
                  </Label>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              disabled={dimensions.length === 0}
              onClick={() => setPreview(true)}
            >
              <Play className="size-4" />
              Run preview
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Preview — {objectType}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!preview ? (
              <EmptyState
                icon={BarChart3}
                title="No preview yet"
                description="Select dimensions and run preview to see aggregated results."
              />
            ) : (
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {dimensions.includes("Owner") ? (
                        <TableHead>Owner</TableHead>
                      ) : null}
                      {dimensions.includes("Source") ? (
                        <TableHead>Source</TableHead>
                      ) : null}
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, i) => (
                      <TableRow key={i}>
                        {dimensions.includes("Owner") ? (
                          <TableCell>{row.owner}</TableCell>
                        ) : null}
                        {dimensions.includes("Source") ? (
                          <TableCell>{row.source}</TableCell>
                        ) : null}
                        <TableCell className="font-medium">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
