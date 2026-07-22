"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import { PORTAL_CUSTOMER } from "@/lib/mock-data/portal";

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_LABEL: Record<string, string> = {
  support: "Technical support",
  billing: "Billing",
  account: "Account",
  other: "Other",
};

export function CreateRequestDialog({ open, onOpenChange }: CreateRequestDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("support");
  const [description, setDescription] = useState("");
  const addIntakeFromPortal = useCaseManagerStore((s) => s.addIntakeFromPortal);

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    const ref = `CM-${1060 + Math.floor(Math.random() * 900)}`;
    addIntakeFromPortal({
      subject: title.trim(),
      body: description.trim() || `${TYPE_LABEL[type]} request`,
      contactId: PORTAL_CUSTOMER.id,
      submitterName: `${PORTAL_CUSTOMER.firstName} ${PORTAL_CUSTOMER.lastName}`,
      submitterEmail: PORTAL_CUSTOMER.email,
      priority: "medium",
      sourceRef: ref,
    });
    toast.success(`Request ${ref} submitted`, {
      description: "Your rep will respond shortly — track it under My requests.",
    });
    setTitle("");
    setType("support");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New request</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v ?? "support")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="support">Technical support</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Subject</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary" />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you need..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
