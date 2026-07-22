"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FolderKanban,
  Sparkles,
  UserPlus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  CM_CASE_TEMPLATES,
  CM_PROJECTS,
  CM_QUEUES,
} from "@/lib/mock-data/case-manager";
import { MOCK_CONTACTS, getContactById, mapContactField } from "@/lib/mock-data";
import { useCaseManagerStore } from "@/lib/stores/case-manager-store";
import type { CmPriority, IntakeItem } from "@/lib/types/case-manager";
import { cn } from "@/lib/utils";
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
import { PriorityBadge } from "@/components/case-manager/cm-status-badges";

interface ConvertToCaseWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intake?: IntakeItem;
  contactId?: string;
  prefill?: { title?: string; description?: string };
}

const PRIORITIES: CmPriority[] = ["low", "medium", "high", "urgent"];
const STEPS = ["Route", "Details", "Review"];

export function ConvertToCaseWizard({
  open,
  onOpenChange,
  intake,
  contactId,
  prefill,
}: ConvertToCaseWizardProps) {
  const router = useRouter();
  const convertToCase = useCaseManagerStore((s) => s.convertToCase);

  const [step, setStep] = useState(0);
  const [projectId, setProjectId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [queueId, setQueueId] = useState("");
  const [assignee, setAssignee] = useState("");
  const [priority, setPriority] = useState<CmPriority>("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [createContact, setCreateContact] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const resolvedContactId = contactId ?? intake?.linkedContactId ?? "";
  const isAnonymous = !resolvedContactId;

  // Seed state whenever the wizard opens.
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setProjectId("");
    setTemplateId("");
    setQueueId("");
    setAssignee("");
    setPriority(intake?.priority ?? "medium");
    setTitle(prefill?.title ?? intake?.subject ?? "");
    setDescription(prefill?.description ?? intake?.body ?? "");
    setSelectedContactId(resolvedContactId);
    setCreateContact(isAnonymous);
    setFieldValues({});
  }, [open, intake, prefill, resolvedContactId, isAnonymous]);

  const project = CM_PROJECTS.find((p) => p.id === projectId);
  const template = CM_CASE_TEMPLATES.find((t) => t.id === templateId);
  const projectTemplates = CM_CASE_TEMPLATES.filter((t) => t.projectId === projectId);
  const projectQueues = CM_QUEUES.filter((q) => q.projectId === projectId);
  const contact = selectedContactId ? getContactById(selectedContactId) : undefined;

  // Apply template defaults + prefill custom fields from the linked contact.
  const applyTemplate = (id: string) => {
    setTemplateId(id);
    const t = CM_CASE_TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setPriority(intake?.priority ?? t.defaultPriority);
    setQueueId(t.defaultQueueId);
    const proj = CM_PROJECTS.find((p) => p.id === t.projectId);
    setAssignee(proj?.team[0] ?? "");
    const seeded: Record<string, string> = {};
    t.fields.forEach((f) => {
      if (f.crmField && contact) seeded[f.key] = mapContactField(contact, f.crmField);
    });
    setFieldValues(seeded);
  };

  const assigneeOptions = useMemo(() => {
    const q = projectQueues.find((x) => x.id === queueId);
    return Array.from(new Set([...(project?.team ?? []), ...(q?.members ?? [])]));
  }, [project, projectQueues, queueId]);

  const canNext =
    step === 0
      ? Boolean(projectId && templateId)
      : step === 1
      ? Boolean(title.trim() && (selectedContactId || createContact))
      : true;

  const handleCreate = () => {
    const newCase = convertToCase({
      intakeId: intake?.id,
      contactId: createContact ? undefined : selectedContactId || undefined,
      newContact:
        createContact && intake
          ? { name: intake.submitterName, email: intake.submitterEmail }
          : undefined,
      title: title.trim(),
      description: description.trim(),
      projectId,
      queueId,
      assignee,
      priority,
      caseType: template?.caseType ?? "General",
      customFields: template
        ? template.fields.map((f) => ({ label: f.label, value: fieldValues[f.key] ?? "—" }))
        : [],
      source: intake ? intake.channel : "crm",
      sourceRef: intake?.sourceRef,
    });
    toast.success(`Case ${newCase.displayId} created`, {
      description: `Routed to ${newCase.queueName} · ${newCase.assignee}`,
    });
    onOpenChange(false);
    router.push(`/cases/${newCase.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Convert to case</DialogTitle>
          <DialogDescription>
            {intake
              ? `From ${intake.channel} intake${intake.sourceRef ? ` · ${intake.sourceRef}` : ""}`
              : "Log a back-office case from this record"}
          </DialogDescription>
          <div className="mt-3 flex items-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    i < step
                      ? "bg-primary text-primary-foreground"
                      : i === step
                      ? "border-2 border-primary text-primary"
                      : "border border-border text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                <span className={cn("text-xs", i === step ? "font-medium" : "text-muted-foreground")}>
                  {label}
                </span>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="max-h-[52vh] overflow-y-auto px-6 py-5">
          {/* Step 0 — Route: project + template */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Project</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CM_PROJECTS.filter((p) => p.status === "Active").map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setProjectId(p.id);
                        setTemplateId("");
                      }}
                      className={cn(
                        "flex items-start gap-2 rounded-lg border p-3 text-left transition-colors",
                        projectId === p.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <FolderKanban className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {projectId && (
                <div className="space-y-2">
                  <Label>Case template</Label>
                  <div className="space-y-2">
                    {projectTemplates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyTemplate(t.id)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors",
                          templateId === t.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <div>
                          <p className="text-sm font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.fields.length} fields · SLA {t.slaHours}h
                          </p>
                        </div>
                        <PriorityBadge priority={t.defaultPriority} />
                      </button>
                    ))}
                    {projectTemplates.length === 0 && (
                      <p className="text-sm text-muted-foreground">No templates for this project.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Contact */}
              <div className="space-y-2">
                <Label>Contact</Label>
                {isAnonymous ? (
                  <div className="rounded-lg border border-dashed p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <UserPlus className="size-4 text-muted-foreground" />
                      <span className="font-medium">{intake?.submitterName ?? "Anonymous"}</span>
                      <Badge variant="outline" className="text-[10px]">New contact</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {intake?.submitterEmail} — a Connect CRM contact will be created and linked.
                    </p>
                  </div>
                ) : (
                  <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact">
                        {(value: string) => {
                          const c = getContactById(value);
                          return c ? `${c.firstName} ${c.lastName} · ${c.company}` : "Select contact";
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_CONTACTS.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.firstName} {c.lastName} · {c.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {contact && (
                  <div className="flex items-center gap-3 rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    <UserRound className="size-3.5" />
                    <span>{contact.email}</span>
                    <Building2 className="size-3.5" />
                    <span>{contact.company}</span>
                    <span className="ml-auto">Owner: {contact.owner}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="case-title">Title</Label>
                <Input id="case-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="case-desc">Description</Label>
                <Textarea
                  id="case-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as CmPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Queue</Label>
                  <Select value={queueId} onValueChange={setQueueId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Queue" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectQueues.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select value={assignee} onValueChange={setAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {assigneeOptions.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Template fields (prefilled from contact) */}
              {template && template.fields.length > 0 && (
                <div className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Sparkles className="size-3.5" /> Prefilled from {template.name} · Connect CRM
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {template.fields.map((f) => (
                      <div key={f.key} className="space-y-1">
                        <Label className="text-xs">
                          {f.label}
                          {f.required && <span className="text-destructive"> *</span>}
                        </Label>
                        <Input
                          value={fieldValues[f.key] ?? ""}
                          onChange={(e) =>
                            setFieldValues((v) => ({ ...v, [f.key]: e.target.value }))
                          }
                          placeholder={f.crmField ? `From ${f.crmField}` : ""}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{description || "No description"}</p>
              </div>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <ReviewRow label="Project" value={project?.name} />
                <ReviewRow label="Template" value={template?.name} />
                <ReviewRow label="Queue" value={projectQueues.find((q) => q.id === queueId)?.name} />
                <ReviewRow label="Assignee" value={assignee || "Unassigned"} />
                <ReviewRow
                  label="Contact"
                  value={
                    createContact
                      ? `${intake?.submitterName} (new)`
                      : contact
                      ? `${contact.firstName} ${contact.lastName}`
                      : "—"
                  }
                />
                <ReviewRow label="Priority" value={priority} className="capitalize" />
              </dl>
              <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                On create: the case is opened in the back office, the contact is linked both ways,
                {intake ? " the intake item is marked Converted," : ""} and the action is written to the sync log.
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="size-4" /> Back
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleCreate}>
              <Check className="size-4" /> Create case
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewRow({
  label,
  value,
  className,
}: {
  label: string;
  value?: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("text-sm font-medium", className)}>{value ?? "—"}</dd>
    </div>
  );
}
