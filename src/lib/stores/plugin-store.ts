"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PluginId } from "@/lib/types";

export interface PluginMeta {
  id: PluginId;
  name: string;
  description: string;
  sku: string;
}

export const PLUGINS: PluginMeta[] = [
  {
    id: "marketing",
    name: "Marketing & Sequences",
    description: "Campaigns, forms, sequences, inbox, and deliverability tools.",
    sku: "Connect Reach",
  },
  {
    id: "cases",
    name: "Case Manager",
    description: "Front-office intake wired to back-office case resolution, with two-way 360° sync.",
    sku: "Connect Resolve",
  },
  {
    id: "esign",
    name: "E-sign",
    description: "Send, track, and store agreements from any contact record.",
    sku: "Connect Sign",
  },
];

interface PluginState {
  enabled: Record<PluginId, boolean>;
  togglePlugin: (id: PluginId) => void;
  setPlugin: (id: PluginId, enabled: boolean) => void;
  isEnabled: (id: PluginId) => boolean;
}

export const usePluginStore = create<PluginState>()(
  persist(
    (set, get) => ({
      enabled: {
        marketing: true,
        cases: true,
        esign: true,
      },
      togglePlugin: (id) =>
        set((s) => ({
          enabled: { ...s.enabled, [id]: !s.enabled[id] },
        })),
      setPlugin: (id, enabled) =>
        set((s) => ({
          enabled: { ...s.enabled, [id]: enabled },
        })),
      isEnabled: (id) => get().enabled[id],
    }),
    { name: "connect-crm-plugins" }
  )
);
