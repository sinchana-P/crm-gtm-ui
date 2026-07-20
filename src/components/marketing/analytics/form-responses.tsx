"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Link2Off, Percent, Search } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSourceMeta, type FormUtmData, type FormUtmSubmission } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";
import { SubmissionSheet } from "./submission-sheet";

interface Props {
  data: FormUtmData;
}

/** Responses tab: form-level stats + the full list of submissions. */
export function FormResponses({ data }: Props) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<FormUtmSubmission | null>(null);
  const s = data.summary;

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return data.submissions;
    return data.submissions.filter((r) =>
      `${r.name} ${r.email} ${r.campaign ?? ""}`.toLowerCase().includes(q)
    );
  }, [data.submissions, search]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Views" value={s.views.toLocaleString()} subtitle="Form page views" icon={Eye} />
        <StatCard title="Submissions" value={s.submissions} subtitle="Completed responses" icon={CheckCircle2} />
        <StatCard title="Submission rate" value={`${s.submissionRate}%`} subtitle="Submissions ÷ views" icon={Percent} />
      </div>

      <Card className="shadow-none">
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">Responses</CardTitle>
            <CardDescription>Every submission captured by this form.</CardDescription>
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search by name, email, campaign…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={Link2Off} title="No responses match" description="Try a different search." />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Respondent</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="hidden md:table-cell">Campaign</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => setActive(r)}>
                    <TableCell>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </TableCell>
                    <TableCell>
                      {r.source ? (
                        <span className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full" style={{ backgroundColor: getSourceMeta(r.source).chart }} />
                          <Badge variant="outline" className="capitalize">{r.source}</Badge>
                        </span>
                      ) : (
                        <Badge variant="outline" className="border-0 bg-muted-foreground/10 text-muted-foreground">
                          <Link2Off className="mr-1 size-3" /> Direct
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">
                      {r.campaign ?? "—"}
                    </TableCell>
                    <TableCell className="hidden text-right text-xs text-muted-foreground sm:table-cell">
                      {formatDateTime(r.submittedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SubmissionSheet submission={active} onClose={() => setActive(null)} />
    </div>
  );
}
