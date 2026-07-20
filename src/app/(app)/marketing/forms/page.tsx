"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_FORMS } from "@/lib/mock-data";
import { formatDate } from "@/lib/format";

export default function FormsPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Forms"
        description="Capture leads with forms. Open a form to see its responses and UTM analytics."
        actions={
          <Button>
            <Plus className="size-4" /> New form
          </Button>
        }
      />

      <Card className="shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Submissions</TableHead>
                <TableHead className="hidden text-right sm:table-cell">Conversion</TableHead>
                <TableHead className="hidden text-right md:table-cell">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_FORMS.map((f) => (
                <TableRow
                  key={f.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/marketing/forms/${f.id}`)}
                >
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {f.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {f.submissions.toLocaleString()}
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums text-muted-foreground sm:table-cell">
                    {f.conversionRate}%
                  </TableCell>
                  <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                    {formatDate(f.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
