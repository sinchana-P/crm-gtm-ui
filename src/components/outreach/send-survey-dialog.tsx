"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Link2, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { MOCK_CONTACTS, MOCK_SURVEYS, getContactById } from "@/lib/mock-data";
import type { OutreachChannel } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface SendSurveyDialogProps {
  contactId?: string;
  surveyId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendSurveyDialog({
  contactId,
  surveyId: initialSurveyId,
  open,
  onOpenChange,
}: SendSurveyDialogProps) {
  const [selectedContactId, setSelectedContactId] = useState(contactId ?? "");
  const [surveyId, setSurveyId] = useState(initialSurveyId ?? "sv1");
  const [channels, setChannels] = useState<OutreachChannel[]>(["email"]);
  const [attachToCase, setAttachToCase] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const contact = useMemo(
    () => (selectedContactId ? getContactById(selectedContactId) : undefined),
    [selectedContactId]
  );
  const survey = useMemo(
    () => MOCK_SURVEYS.find((s) => s.id === surveyId),
    [surveyId]
  );

  useEffect(() => {
    if (!open) return;
    setSelectedContactId(contactId ?? "");
    if (initialSurveyId) setSurveyId(initialSurveyId);
  }, [open, contactId, initialSurveyId]);

  useEffect(() => {
    if (!survey) return;
    setSubject(`We'd love your feedback — ${survey.name}`);
    setMessage(
      `Hi {{first_name}},\n\nPlease take a moment to share your experience. Your response helps us improve.\n\n{{survey_link}}\n\nThank you,\n{{owner_name}}`
    );
    setChannels(survey.channels.filter((c): c is OutreachChannel => c !== "web"));
  }, [survey]);

  function toggleChannel(ch: OutreachChannel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  function handleSend() {
    if (!contact || !survey || channels.length === 0) return;
    toast.success("Survey sent", {
      description: `${survey.name} sent to ${contact.firstName} ${contact.lastName}.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send survey to customer</DialogTitle>
          <DialogDescription>
            Deliver NPS, CSAT, or onboarding feedback with branching follow-ups on the
            customer portal or via magic link.
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
                {MOCK_CONTACTS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Survey flow</Label>
            <Select value={surveyId} onValueChange={(v) => setSurveyId(v ?? "sv1")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_SURVEYS.filter((s) => s.status === "active").map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {survey ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <ClipboardList className="size-4" />
                Branching preview
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Promoter: {survey.promoterPath}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Detractor: {survey.detractorPath}
              </p>
              {survey.followUpAction ? (
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  Auto: {survey.followUpAction}
                </Badge>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Channels</Label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "email" as const, label: "Email", icon: Mail },
                  { id: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
                  { id: "portal" as const, label: "Portal", icon: Link2 },
                ] as const
              ).map((ch) => (
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

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Link to open case</p>
              <p className="text-xs text-muted-foreground">
                Attach survey context when sent after case resolution
              </p>
            </div>
            <Switch checked={attachToCase} onCheckedChange={setAttachToCase} />
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!contact || channels.length === 0}>
            Send survey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
