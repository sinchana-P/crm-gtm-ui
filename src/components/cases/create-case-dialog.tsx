"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { toast } from "sonner";
import {
  MOCK_CASE_TEMPLATES,
  MOCK_CONTACTS,
  getContactById,
  mapContactField,
} from "@/lib/mock-data";
import type { CaseTemplate, ContactRecord } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CreateCaseDialogProps {
  contactId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCaseDialog({ contactId, open, onOpenChange }: CreateCaseDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [templateId, setTemplateId] = useState<string>("");
  const [selectedContactId, setSelectedContactId] = useState(contactId ?? "");
  const [contactSearch, setContactSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const template = useMemo(
    () => MOCK_CASE_TEMPLATES.find((t) => t.id === templateId),
    [templateId]
  );

  const contact = useMemo(
    () => (selectedContactId ? getContactById(selectedContactId) : undefined),
    [selectedContactId]
  );

  const filteredContacts = useMemo(() => {
    const q = contactSearch.toLowerCase();
    if (!q) return MOCK_CONTACTS.slice(0, 6);
    return MOCK_CONTACTS.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false)
    );
  }, [contactSearch]);

  const mappedFields = useMemo(() => {
    if (!template || !contact) return [];
    return template.fieldMappings.map((m) => ({
      label: m.templateField,
      value: mapContactField(contact, m.contactField),
      source: m.contactField,
    }));
  }, [template, contact]);

  useEffect(() => {
    if (open) {
      setStep(contactId && templateId ? 2 : 1);
      setSelectedContactId(contactId ?? "");
    } else {
      setStep(1);
      setTemplateId("");
      setContactSearch("");
      setTitle("");
      setDescription("");
      if (!contactId) setSelectedContactId("");
    }
  }, [open, contactId, templateId]);

  useEffect(() => {
    if (template && contact && step === 2 && !title) {
      setTitle(`${template.type} — ${contact.firstName} ${contact.lastName}`);
      setDescription(`Case opened via ${template.name} template.`);
    }
  }, [template, contact, step, title]);

  function handleTemplateSelect(id: string | null) {
    if (!id) return;
    setTemplateId(id);
    if (selectedContactId) setStep(2);
  }

  function handleContactSelect(id: string) {
    setSelectedContactId(id);
    if (templateId) setStep(2);
  }

  function handleSubmit() {
    if (!template || !contact) return;
    toast.success("Case created", {
      description: `${title} assigned to ${template.defaultAssignee}.`,
    });
    onOpenChange(false);
  }

  const canProceed = Boolean(templateId && selectedContactId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create case</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Pick a template and contact — two clicks to open a case."
              : "Review pre-filled fields from the template and contact record."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={step === 1 ? "default" : "secondary"}>1. Template & contact</Badge>
          <span>→</span>
          <Badge variant={step === 2 ? "default" : "secondary"}>2. Confirm & create</Badge>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Case template</Label>
              <Select value={templateId} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select intake template" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_CASE_TEMPLATES.filter((t) => t.active).map((t) => (
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

            {!contactId ? (
              <div className="space-y-2">
                <Label>Contact</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search by name, email, or company"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                  />
                </div>
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-1">
                  {filteredContacts.map((c) => (
                    <ContactRow
                      key={c.id}
                      contact={c}
                      selected={selectedContactId === c.id}
                      onSelect={() => handleContactSelect(c.id)}
                    />
                  ))}
                </ul>
              </div>
            ) : contact ? (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">
                  {contact.firstName} {contact.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{contact.email}</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            {template && contact ? (
              <>
                <div className="grid gap-3 rounded-lg border p-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Template</p>
                    <p className="font-medium">{template.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assignee</p>
                    <p className="font-medium">{template.defaultAssignee}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <p className="font-medium capitalize">{template.defaultPriority}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SLA</p>
                    <p className="font-medium">{template.slaHours}h resolution</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case-title">Title</Label>
                  <Input id="case-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case-description">Description</Label>
                  <Textarea
                    id="case-description"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mapped from contact</Label>
                  <div className="rounded-lg border divide-y">
                    {mappedFields.map((f) => (
                      <div key={f.label} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="text-muted-foreground">{f.label}</span>
                        <span className="font-medium">{f.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 2 ? (
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          ) : null}
          {step === 1 ? (
            <Button disabled={!canProceed} onClick={() => setStep(2)}>
              Continue
              <ChevronsUpDown className="ml-1 size-4 opacity-50" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!title.trim()}>
              <Check className="mr-1 size-4" />
              Create case
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ContactRow({
  contact,
  selected,
  onSelect,
}: {
  contact: ContactRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
        selected && "bg-muted"
      )}
    >
      <div>
        <p className="font-medium">
          {contact.firstName} {contact.lastName}
        </p>
        <p className="text-xs text-muted-foreground">
          {contact.company ?? contact.email}
        </p>
      </div>
      {selected ? <Check className="size-4 text-primary" /> : null}
    </button>
  );
}
