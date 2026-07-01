"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import type { PortalInfoField, PortalRequest } from "@/lib/types/portal";
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
import { Textarea } from "@/components/ui/textarea";

interface InfoResponseDialogProps {
  request: PortalRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfoResponseDialog({ request, open, onOpenChange }: InfoResponseDialogProps) {
  const fields = request.requiredFields ?? [];

  const handleSubmit = () => {
    toast.success("Response submitted and logged to your request");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Provide requested information</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {request.number} — additional details requested by {request.assignee}.
        </p>
        <div className="grid gap-4 py-2">
          {fields.map((field) => (
            <FieldInput key={field.key} field={field} />
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit response</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldInput({ field }: { field: PortalInfoField }) {
  if (field.type === "textarea") {
    return (
      <div className="grid gap-2">
        <Label>{field.label}{field.required ? " *" : ""}</Label>
        <Textarea rows={3} />
      </div>
    );
  }
  if (field.type === "attachment") {
    return (
      <div className="grid gap-2">
        <Label>{field.label}{field.required ? " *" : ""}</Label>
        <Button variant="outline" className="justify-start" type="button">
          <Upload className="mr-2 size-4" />
          Choose file
        </Button>
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      <Label>{field.label}{field.required ? " *" : ""}</Label>
      <Input type={field.type === "date" ? "date" : "text"} />
    </div>
  );
}
