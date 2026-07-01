"use client";

import { useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import {
  MOCK_CONTACTS,
  MOCK_ESIGN_TEMPLATES,
  getContactById,
  mapContactField,
} from "@/lib/mock-data";
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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SendEnvelopeDialogProps {
  contactId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type StorageDestination = "drive" | "onedrive" | "platform";

export function SendEnvelopeDialog({ contactId, open, onOpenChange }: SendEnvelopeDialogProps) {
  const [templateId, setTemplateId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(contactId ?? "");
  const [signingOrder, setSigningOrder] = useState<"sequential" | "parallel">("sequential");
  const [reminders, setReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState("3");
  const [storage, setStorage] = useState<StorageDestination>("platform");

  const template = useMemo(
    () => MOCK_ESIGN_TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );
  const contact = useMemo(
    () => (selectedContactId ? getContactById(selectedContactId) : undefined),
    [selectedContactId]
  );

  const mappedFields = useMemo(() => {
    if (!template || !contact) return [];
    return template.fields.map((f) => ({
      label: f.label,
      value: mapContactField(contact, f.crmField),
    }));
  }, [template, contact]);

  useEffect(() => {
    if (open) setSelectedContactId(contactId ?? "");
    else {
      setTemplateId("");
      if (!contactId) setSelectedContactId("");
    }
  }, [open, contactId]);

  function handleSend() {
    if (!template || !contact) return;
    toast.success("Envelope sent", {
      description: `${template.name} sent to ${contact.firstName} ${contact.lastName}.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send agreement</DialogTitle>
          <DialogDescription>
            Send an NDA or agreement with CRM field mapping and storage routing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sign template</Label>
            <Select value={templateId} onValueChange={(v) => setTemplateId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_ESIGN_TEMPLATES.filter((t) => t.active).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} — {t.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!contactId ? (
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select value={selectedContactId} onValueChange={(v) => setSelectedContactId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CONTACTS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} — {c.company ?? c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : contact ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">
                {contact.firstName} {contact.lastName}
              </p>
              <p className="text-muted-foreground">{contact.email}</p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Signing order</Label>
            <RadioGroup
              value={signingOrder}
              onValueChange={(v) => setSigningOrder(v as "sequential" | "parallel")}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="sequential" id="seq" />
                <Label htmlFor="seq" className="font-normal">
                  Sequential
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="parallel" id="par" />
                <Label htmlFor="par" className="font-normal">
                  Parallel
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Automatic reminders</p>
              <p className="text-xs text-muted-foreground">Nudge unsigned recipients</p>
            </div>
            <Switch checked={reminders} onCheckedChange={setReminders} />
          </div>
          {reminders ? (
            <div className="space-y-2">
              <Label>Reminder interval (days)</Label>
              <Input
                type="number"
                min={1}
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Storage destination</Label>
            <Select value={storage} onValueChange={(v) => setStorage(v as StorageDestination)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drive">Google Drive</SelectItem>
                <SelectItem value="onedrive">OneDrive</SelectItem>
                <SelectItem value="platform">Connect platform</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mappedFields.length > 0 ? (
            <div className="space-y-2">
              <Label>CRM field mapping preview</Label>
              <div className="rounded-lg border divide-y text-sm">
                {mappedFields.map((f) => (
                  <div key={f.label} className="flex justify-between px-3 py-2">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-medium">{f.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSend}
            disabled={!templateId || !selectedContactId}
          >
            <Send className="mr-2 size-4" />
            Send envelope
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
