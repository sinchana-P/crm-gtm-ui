"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { contactName } from "@/lib/format";
import type { ContactRecord } from "@/lib/types";

interface ConvertLeadDialogProps {
  contact: ContactRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
}

export function ConvertLeadDialog({
  contact,
  open,
  onOpenChange,
  onConfirm,
}: ConvertLeadDialogProps) {
  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert lead</DialogTitle>
          <DialogDescription>
            Convert {contactName(contact.firstName, contact.lastName)} to a
            contact and optionally create a deal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Lifecycle stage</Label>
            <Select defaultValue="sql">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mql">MQL</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Assign owner</Label>
            <Select defaultValue={contact.ownerId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="u1">Priya Sharma</SelectItem>
                <SelectItem value="u2">Arjun Mehta</SelectItem>
                <SelectItem value="u3">Neha Reddy</SelectItem>
                <SelectItem value="u4">Karthik N</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm?.();
              onOpenChange(false);
            }}
          >
            Convert lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
