"use client";

import { create } from "zustand";
import type { EmailTemplate } from "@/lib/types";
import { MOCK_EMAIL_TEMPLATES } from "@/lib/mock-data";

export function createTemplateId() {
  return `t${Date.now()}`;
}
let blockCounter = 0;
export function createBlockId() {
  blockCounter += 1;
  return `blk-${Date.now()}-${blockCounter}`;
}

interface EmailTemplateState {
  templates: EmailTemplate[];
  addTemplate: (template: EmailTemplate) => void;
  updateTemplate: (id: string, patch: Partial<EmailTemplate>) => void;
  duplicateTemplate: (id: string) => EmailTemplate | undefined;
  setStatus: (id: string, status: NonNullable<EmailTemplate["status"]>) => void;
  deleteTemplate: (id: string) => void;
}

export const useEmailTemplateStore = create<EmailTemplateState>()((set, get) => ({
  templates: MOCK_EMAIL_TEMPLATES,

  addTemplate: (template) => set((s) => ({ templates: [template, ...s.templates] })),

  updateTemplate: (id, patch) =>
    set((s) => ({
      templates: s.templates.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
      ),
    })),

  duplicateTemplate: (id) => {
    const source = get().templates.find((t) => t.id === id);
    if (!source) return undefined;
    const copy: EmailTemplate = {
      ...source,
      id: createTemplateId(),
      name: `${source.name} (Copy)`,
      status: "draft",
      sent: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ templates: [copy, ...s.templates] }));
    return copy;
  },

  setStatus: (id, status) => get().updateTemplate(id, { status }),
  deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
}));
