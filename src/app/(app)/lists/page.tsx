"use client";

import { useState } from "react";
import { Sparkles, Tags } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_CONTACTS, MOCK_LISTS } from "@/lib/mock-data";
import { contactName, formatDate } from "@/lib/format";

export default function ListsPage() {
  const [selectedListId, setSelectedListId] = useState(MOCK_LISTS[0]?.id ?? "");
  const [nlQuery, setNlQuery] = useState("");
  const [generated, setGenerated] = useState<string | null>(null);

  const selectedList = MOCK_LISTS.find((l) => l.id === selectedListId);
  const previewMembers = MOCK_CONTACTS.slice(0, 4);

  const handleGenerate = () => {
    if (!nlQuery.trim()) return;
    setGenerated(
      `Dynamic list: contacts where ${nlQuery.toLowerCase().includes("bangalore") ? "city = Bangalore AND days_since_contact > 60" : "owner = current_user AND lifecycle_stage IN (lead, mql)"} — estimated ${Math.floor(Math.random() * 400 + 50)} members`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lists & Tags"
        description="Static segments, dynamic lists, and AI-assisted list building."
        actions={
          <Button>
            <Tags className="size-4" />
            New list
          </Button>
        }
      />

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            AI list builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Describe your list in plain language, e.g. Bangalore contacts not contacted in 60 days with health score below 50"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            rows={3}
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleGenerate} disabled={!nlQuery.trim()}>
              Generate list
            </Button>
            {generated ? (
              <p className="text-sm text-muted-foreground">{generated}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_LISTS.map((list) => (
                <TableRow
                  key={list.id}
                  className="cursor-pointer"
                  data-state={selectedListId === list.id ? "selected" : undefined}
                  onClick={() => setSelectedListId(list.id)}
                >
                  <TableCell className="font-medium">{list.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{list.type}</Badge>
                  </TableCell>
                  <TableCell>{list.count.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(list.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedList?.name ?? "List detail"}
            </CardTitle>
            {selectedList?.criteria ? (
              <p className="text-sm text-muted-foreground">
                Criteria: {selectedList.criteria}
              </p>
            ) : null}
          </CardHeader>
          <CardContent>
            {!selectedList ? (
              <EmptyState
                icon={Tags}
                title="Select a list"
                description="Choose a list from the table to preview members."
              />
            ) : (
              <ul className="space-y-3">
                {previewMembers.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {contactName(c.firstName, c.lastName)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.company ?? c.email}
                      </p>
                    </div>
                    <Badge variant="secondary">{c.lifecycleStage}</Badge>
                  </li>
                ))}
                <p className="text-xs text-muted-foreground">
                  Showing 4 of {selectedList.count.toLocaleString()} members
                </p>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
