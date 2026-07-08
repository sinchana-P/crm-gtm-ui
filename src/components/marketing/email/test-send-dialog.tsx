"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { MOCK_CONTACTS } from "@/lib/mock-data";
import { contactName } from "@/lib/format";

export function TestSendDialog({
  open,
  onOpenChange,
  templateName,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  templateName: string;
}) {
  const [recipients, setRecipients] = useState("maxdev@ivoyant.com");
  const [asContact, setAsContact] = useState("");
  const contacts = MOCK_CONTACTS.slice(0, 8);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send a test email</DialogTitle>
          <DialogDescription>
            Send “{templateName}” to yourself or teammates to check how it renders.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label htmlFor="ts-to">Send to</Label>
            <Input
              id="ts-to"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="comma-separated emails"
            />
          </div>
          <div className="grid gap-2">
            <Label>Preview as contact (personalization)</Label>
            <Select
              items={{ none: "Generic sample data", ...Object.fromEntries(contacts.map((c) => [c.id, contactName(c.firstName, c.lastName)])) }}
              value={asContact || "none"}
              onValueChange={(v) => setAsContact(v === "none" ? "" : (v ?? ""))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Generic sample data</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {contactName(c.firstName, c.lastName)} — {c.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Tokens render with this contact&rsquo;s real values.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const n = recipients.split(",").filter((r) => r.trim()).length;
              toast.success(`Test email sent to ${n} recipient${n === 1 ? "" : "s"}`);
              onOpenChange(false);
            }}
          >
            <Send className="size-4" /> Send test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
