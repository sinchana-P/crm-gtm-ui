"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import {
  MOCK_CONTACTS,
  WHATSAPP_TEMPLATES,
  getContactById,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface SendWhatsAppDialogProps {
  contactId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendWhatsAppDialog({
  contactId,
  open,
  onOpenChange,
}: SendWhatsAppDialogProps) {
  const [selectedContactId, setSelectedContactId] = useState(contactId ?? "");
  const [templateId, setTemplateId] = useState("");
  const [message, setMessage] = useState("");
  const [logToTimeline, setLogToTimeline] = useState(true);

  const contact = useMemo(
    () => (selectedContactId ? getContactById(selectedContactId) : undefined),
    [selectedContactId]
  );

  const approvedTemplates = WHATSAPP_TEMPLATES.filter((t) => t.status === "approved");

  useEffect(() => {
    if (open) setSelectedContactId(contactId ?? "");
    else {
      setTemplateId("");
      setMessage("");
      if (!contactId) setSelectedContactId("");
    }
  }, [open, contactId]);

  useEffect(() => {
    const tpl = approvedTemplates.find((t) => t.id === templateId);
    if (tpl && contact) {
      let body = tpl.body;
      body = body.replace("{{1}}", contact.firstName);
      body = body.replace("{{2}}", contact.owner);
      setMessage(body);
    }
  }, [templateId, contact, approvedTemplates]);

  function handleSend() {
    if (!contact || !message.trim()) return;
    if (!contact.consent.whatsapp) {
      toast.error("WhatsApp consent not granted for this contact");
      return;
    }
    toast.success("WhatsApp message sent", {
      description: logToTimeline
        ? `Delivered to ${contact.phone} and logged to timeline.`
        : `Delivered to ${contact.phone}.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="size-5" />
            Send WhatsApp message
          </DialogTitle>
          <DialogDescription>
            Send an approved template or free-form reply within the 24-hour session window.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Contact</Label>
            <Select
              value={selectedContactId}
              onValueChange={(v) => setSelectedContactId(v ?? "")}
              disabled={!!contactId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CONTACTS.filter((c) => c.consent.whatsapp).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} — {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {contact ? (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={contact.consent.whatsapp ? "outline" : "destructive"}>
                {contact.consent.whatsapp ? "WA opt-in" : "No consent"}
              </Badge>
              <span className="text-muted-foreground">{contact.phone}</span>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Template (optional)</Label>
            <Select value={templateId} onValueChange={(v) => setTemplateId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Free-form or pick template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Free-form message</SelectItem>
                {approvedTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} · {t.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your WhatsApp message..."
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Log to contact timeline</p>
              <p className="text-xs text-muted-foreground">Visible in activity history</p>
            </div>
            <Switch checked={logToTimeline} onCheckedChange={setLogToTimeline} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!contact || !message.trim()}>
            <Send className="size-4" />
            Send WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
