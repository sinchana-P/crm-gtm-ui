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

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRequestDialog({ open, onOpenChange }: CreateRequestDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("support");

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    toast.success("Request submitted — your rep will respond shortly");
    setTitle("");
    setType("support");
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
            <Textarea rows={4} placeholder="Describe what you need..." />
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
