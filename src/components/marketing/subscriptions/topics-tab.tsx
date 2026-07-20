"use client";

import { useState } from "react";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SUB_TOPICS, type SubTopic } from "@/lib/mock-data";

export function TopicsTab() {
  const [topics, setTopics] = useState<SubTopic[]>(SUB_TOPICS);
  const [editing, setEditing] = useState<SubTopic | null>(null);
  const [isNew, setIsNew] = useState(false);

  function openNew() {
    setEditing({ id: `t${Date.now()}`, name: "", description: "", required: false, defaultOptIn: false, subscribers: 0 });
    setIsNew(true);
  }
  function openEdit(t: SubTopic) {
    setEditing({ ...t });
    setIsNew(false);
  }
  function save() {
    if (!editing || !editing.name.trim()) return;
    setTopics((list) => (isNew ? [...list, editing] : list.map((t) => (t.id === editing.id ? editing : t))));
    toast.success(isNew ? "Topic created" : "Topic updated");
    setEditing(null);
  }
  function remove(id: string) {
    setTopics((list) => list.filter((t) => t.id !== id));
    toast.success("Topic removed");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Topics let contacts choose what they receive. Opting out of one keeps the others. Required topics can’t be turned off.
        </p>
        <Button onClick={openNew}><Plus className="size-4" /> New topic</Button>
      </div>

      <div className="grid gap-3">
        {topics.map((t) => (
          <Card key={t.id} className="shadow-none">
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {t.name}
                  {t.required && (
                    <Badge variant="outline" className="border-0 bg-muted text-xs text-muted-foreground">
                      <Lock className="mr-1 size-3" /> Always on
                    </Badge>
                  )}
                  {!t.required && t.defaultOptIn && (
                    <Badge variant="outline" className="border-0 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-400">
                      Default opt-in
                    </Badge>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">{t.description}</p>
                <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{t.subscribers.toLocaleString()} subscribed</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon-sm" aria-label="Edit topic" onClick={() => openEdit(t)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label="Delete topic" disabled={t.required} onClick={() => remove(t.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Email footer</CardTitle>
          <CardDescription>Appended above the unsubscribe link on every marketing email.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            defaultValue="You're receiving this because you opted in at connectcrm.io. Manage your preferences or unsubscribe anytime."
            rows={2}
          />
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isNew ? "New topic" : "Edit topic"}</DialogTitle>
            <DialogDescription>Contacts see this on the preference page.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3 py-1">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g. Product updates" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Short description" />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Default opt-in</p>
                  <p className="text-xs text-muted-foreground">New contacts start subscribed to this topic.</p>
                </div>
                <Switch checked={editing.defaultOptIn} onCheckedChange={(v) => setEditing({ ...editing, defaultOptIn: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Required (transactional)</p>
                  <p className="text-xs text-muted-foreground">Can’t be unsubscribed — sends here always deliver.</p>
                </div>
                <Switch checked={editing.required} onCheckedChange={(v) => setEditing({ ...editing, required: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>{isNew ? "Create" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
