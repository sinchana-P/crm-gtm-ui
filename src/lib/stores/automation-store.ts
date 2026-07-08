"use client";

import { create } from "zustand";
import type { Automation } from "@/lib/types";
import { MOCK_AUTOMATIONS } from "@/lib/mock-data";

export function createAutomationId() {
  return `au${Date.now()}`;
}

interface AutomationState {
  automations: Automation[];
  addAutomation: (automation: Automation) => void;
  updateAutomation: (id: string, patch: Partial<Automation>) => void;
  duplicateAutomation: (id: string) => Automation | undefined;
  setStatus: (id: string, status: Automation["status"]) => void;
  setArchived: (id: string, archived: boolean) => void;
  deleteAutomation: (id: string) => void;
}

export const useAutomationStore = create<AutomationState>()((set, get) => ({
  automations: MOCK_AUTOMATIONS,

  addAutomation: (automation) => set((s) => ({ automations: [automation, ...s.automations] })),

  updateAutomation: (id, patch) =>
    set((s) => ({
      automations: s.automations.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
      ),
    })),

  duplicateAutomation: (id) => {
    const source = get().automations.find((a) => a.id === id);
    if (!source) return undefined;
    const copy: Automation = {
      ...source,
      id: createAutomationId(),
      name: `${source.name} (Copy)`,
      status: "draft",
      archived: false,
      enrolled: 0,
      activeCount: 0,
      completedCount: 0,
      goalMet: 0,
      runLog: [],
      lastRun: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ automations: [copy, ...s.automations] }));
    return copy;
  },

  setStatus: (id, status) => get().updateAutomation(id, { status }),
  setArchived: (id, archived) => get().updateAutomation(id, { archived }),
  deleteAutomation: (id) =>
    set((s) => ({ automations: s.automations.filter((a) => a.id !== id) })),
}));
