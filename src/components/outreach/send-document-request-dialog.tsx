"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  FileUp,
  Link2,
  Mail,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  DOCUMENT_REQUEST_TEMPLATES,
  MOCK_CONTACTS,
  getContactById,
} from "@/lib/mock-data";
import type { DocumentChecklistItem, OutreachChannel } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SendDocumentRequestDialogProps {
  contactId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CHANNELS: { id: OutreachChannel; label: string; icon: typeof Mail }[] = [
  { id: "email", label: "Email", icon: Mail },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "sms", label: "SMS", icon: Smartphone },
  { id: "portal", label: "Portal task", icon: FileUp },
];

const STEPS = ["Recipient", "Checklist", "Delivery", "Review"] as const;

export function SendDocumentRequestDialog({
  contactId,
  open,
  onOpenChange,
}: SendDocumentRequestDialogProps) {
  const [step, setStep] = useState(0);
  const [selectedContactId, setSelectedContactId] = useState(contactId ?? "");
  const [templateId, setTemplateId] = useState("drt1");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [ttlDays, setTtlDays] = useState("7");
  const [channels, setChannels] = useState<OutreachChannel[]>(["email", "whatsapp"]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const template = useMemo(
    () => DOCUMENT_REQUEST_TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );
  const contact = useMemo(
    () => (selectedContactId ? getContactById(selectedContactId) : undefined),
    [selectedContactId]
  );

  const checklistItems = template?.items ?? [];
  const activeItems = checklistItems.filter((item) => selectedItems.includes(item.id));

  const previewLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/portal/upload/${contact ? `vk-${contact.firstName.toLowerCase()}` : "preview"}`
      : "/portal/upload/preview";

  useEffect(() => {
    if (!open) {
      setStep(0);
      setCopied(false);
      if (!contactId) setSelectedContactId("");
      return;
    }
    setSelectedContactId(contactId ?? "");
  }, [open, contactId]);

  useEffect(() => {
    if (!template) return;
    setSelectedItems(template.items.filter((i) => i.required).map((i) => i.id));
    setTtlDays(String(template.defaultTtlDays));
    setChannels(template.defaultChannels);
    setSubject(`Action required: upload documents for ${template.name}`);
    setMessage(
      `Hi {{first_name}},\n\nPlease upload the requested documents using the secure link below. The link expires in ${template.defaultTtlDays} days.\n\n{{magic_link}}\n\n— {{owner_name}}`
    );
  }, [template]);

  function toggleItem(id: string) {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleChannel(ch: OutreachChannel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  function handleSend() {
    if (!contact || activeItems.length === 0 || channels.length === 0) return;
    toast.success("Document request sent", {
      description: `${activeItems.length} items sent to ${contact.firstName} via ${channels.join(", ")}.`,
    });
    onOpenChange(false);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(previewLink);
    setCopied(true);
    toast.message("Magic link copied");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Request documents from customer</DialogTitle>
          <DialogDescription>
            Send a secure upload link (TTL) via email, WhatsApp, or portal — similar to
            HubSpot file requests or Zoho customer portal tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1 border-b px-6 py-3">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-1">
              <div
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  i <= step ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="size-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-xs sm:inline",
                  i === step ? "font-medium" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 ? (
                <div className="mx-1 hidden h-px flex-1 bg-border sm:block" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {step === 0 ? (
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
                    {MOCK_CONTACTS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} — {c.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Request template</Label>
                <Select value={templateId} onValueChange={(v) => setTemplateId(v ?? "drt1")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_REQUEST_TEMPLATES.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {template ? (
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select documents the customer must upload. Required items are pre-selected.
              </p>
              {checklistItems.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  checked={selectedItems.includes(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Link expires in (days)</Label>
                <Select value={ttlDays} onValueChange={(v) => setTtlDays(v ?? "7")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["3", "5", "7", "14", "30"].map((d) => (
                      <SelectItem key={d} value={d}>
                        {d} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Delivery channels</Label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((ch) => (
                    <Button
                      key={ch.id}
                      type="button"
                      size="sm"
                      variant={channels.includes(ch.id) ? "default" : "outline"}
                      onClick={() => toggleChannel(ch.id)}
                    >
                      <ch.icon className="size-4" />
                      {ch.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Tokens: {"{{first_name}}"}, {"{{magic_link}}"}, {"{{owner_name}}"}, {"{{due_date}}"}
                </p>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                <p className="font-medium">
                  To: {contact ? `${contact.firstName} ${contact.lastName}` : "—"}
                </p>
                <p className="text-muted-foreground">{contact?.email}</p>
                <p className="mt-2">{subject}</p>
                <ul className="mt-3 space-y-1">
                  {activeItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-xs">
                      <FileUp className="size-3" />
                      {item.label}
                      {item.required ? (
                        <Badge variant="outline" className="text-[10px]">
                          Required
                        </Badge>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link2 className="size-4" />
                  Magic upload link (TTL {ttlDays}d)
                </Label>
                <div className="flex gap-2">
                  <Input readOnly value={previewLink} className="font-mono text-xs" />
                  <Button type="button" variant="outline" size="icon" onClick={handleCopyLink}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer lands on a focused upload page — no full portal login required.
                  Completed files sync to the contact record and notify the owner.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 0 && !selectedContactId) ||
                (step === 1 && activeItems.length === 0) ||
                (step === 2 && channels.length === 0)
              }
            >
              Continue
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={!contact}>
              Send request
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChecklistRow({
  item,
  checked,
  onToggle,
}: {
  item: DocumentChecklistItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-lg border p-3 hover:bg-muted/40">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.label}</p>
        {item.description ? (
          <p className="text-xs text-muted-foreground">{item.description}</p>
        ) : null}
        <p className="mt-1 text-[10px] text-muted-foreground">
          {item.acceptedFormats.join(", ")} · max {item.maxSizeMb} MB
          {item.required ? " · Required" : " · Optional"}
        </p>
      </div>
    </label>
  );
}
