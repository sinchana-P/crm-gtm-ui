"use client";

import { useState } from "react";
import { ArrowUpCircle, CheckCircle2, Star, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import type { CmCase } from "@/lib/types/case-manager";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DialogProps {
  case: CmCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EscalateDialog({ case: c, open, onOpenChange }: DialogProps) {
  const escalate = useCaseManagerStore((s) => s.escalateCase);
  const [tier, setTier] = useState<"1" | "2" | "3">("2");
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="size-5 text-orange-500" /> Escalate case
          </DialogTitle>
          <DialogDescription>
            Raise the tier and notify the account owner in Connect CRM. This is logged to the sync trail.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Escalate to tier</Label>
            <Select value={tier} onValueChange={(v) => setTier(v as "1" | "2" | "3")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Tier 1 · Frontline</SelectItem>
                <SelectItem value="2">Tier 2 · Specialist</SelectItem>
                <SelectItem value="3">Tier 3 · Engineering / Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="esc-note">Reason</Label>
            <Textarea id="esc-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why is this being escalated?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              escalate(c.id, Number(tier) as 1 | 2 | 3, note || "Escalated");
              toast.success(`Escalated to Tier ${tier}`, { description: "Account owner notified in Connect CRM." });
              onOpenChange(false);
              setNote("");
            }}
          >
            <ArrowUpCircle className="size-4" /> Escalate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ResolveDialog({ case: c, open, onOpenChange }: DialogProps) {
  const resolve = useCaseManagerStore((s) => s.resolveCase);
  const [note, setNote] = useState("");
  const [csat, setCsat] = useState(5);
  const fromPortal = c.source === "portal" && c.sourceRef;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-500" /> Resolve case
          </DialogTitle>
          <DialogDescription>
            Close out the case and sync the outcome back to the customer.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="res-note">Resolution summary</Label>
            <Textarea id="res-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What was done to resolve this?" />
          </div>
          <div className="space-y-1.5">
            <Label>Expected CSAT (triggers survey)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setCsat(n)} aria-label={`${n} stars`}>
                  <Star className={cn("size-6", n <= csat ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                </button>
              ))}
            </div>
          </div>
          <ul className="space-y-1 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            <li>• Case status → Resolved</li>
            {fromPortal ? <li>• Portal request {c.sourceRef} marked resolved for the customer</li> : null}
            <li>• Resolution logged on the linked Contact 360 timeline</li>
            <li>• CSAT survey queued to the customer</li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              resolve(c.id, note || "Resolved", csat);
              toast.success("Case resolved", {
                description: fromPortal
                  ? `Synced to portal request ${c.sourceRef} + Contact 360.`
                  : "Logged on Contact 360.",
              });
              onOpenChange(false);
              setNote("");
            }}
          >
            <CheckCircle2 className="size-4" /> Resolve &amp; sync
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HandbackDialog({ case: c, open, onOpenChange }: DialogProps) {
  const handback = useCaseManagerStore((s) => s.handbackToSales);
  const [kind, setKind] = useState<"opportunity" | "task">("opportunity");
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo2 className="size-5 text-primary" /> Hand back to sales
          </DialogTitle>
          <DialogDescription>
            Spotted an upsell or renewal? Push it back to the front office as a CRM record.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Create in Connect CRM</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as "opportunity" | "task")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="task">Follow-up task</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hb-note">Context for the account owner</Label>
            <Textarea id="hb-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Customer asked about the enterprise tier during this case." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handback(c.id, kind, note || "Handback from case");
              toast.success(kind === "opportunity" ? "Opportunity created" : "Task created", {
                description: "Added to Connect CRM and logged on Contact 360.",
              });
              onOpenChange(false);
              setNote("");
            }}
          >
            <Undo2 className="size-4" /> Hand back
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
