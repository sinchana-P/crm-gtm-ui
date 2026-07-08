"use client";

import { create } from "zustand";
import type { Campaign, CampaignStatus } from "@/lib/types";
import { MOCK_CAMPAIGNS } from "@/lib/mock-data";

interface CampaignState {
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  duplicateCampaign: (id: string) => Campaign | undefined;
  setStatus: (id: string, status: CampaignStatus) => void;
  setArchived: (id: string, archived: boolean) => void;
}

export const useCampaignStore = create<CampaignState>()((set, get) => ({
  campaigns: MOCK_CAMPAIGNS,

  addCampaign: (campaign) =>
    set((s) => ({ campaigns: [campaign, ...s.campaigns] })),

  updateCampaign: (id, patch) =>
    set((s) => ({
      campaigns: s.campaigns.map((c) =>
        c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
      ),
    })),

  duplicateCampaign: (id) => {
    const source = get().campaigns.find((c) => c.id === id);
    if (!source) return undefined;
    const copy: Campaign = {
      ...source,
      id: `cp${Date.now()}`,
      name: `${source.name} (Copy)`,
      status: "draft",
      archived: false,
      scheduledAt: undefined,
      lastRunAt: undefined,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      goals: source.goals.map((g) => ({ ...g, current: 0 })),
      conversionTargets: source.conversionTargets.map((t) => ({ ...t, conversions: 0 })),
      abTest: source.abTest
        ? {
            ...source.abTest,
            variants: source.abTest.variants.map((v) => ({
              ...v,
              sent: 0,
              opened: 0,
              clicked: 0,
              winner: undefined,
            })),
          }
        : undefined,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      converted: 0,
    };
    set((s) => ({ campaigns: [copy, ...s.campaigns] }));
    return copy;
  },

  setStatus: (id, status) =>
    get().updateCampaign(id, {
      status,
      ...(status === "completed" ? { completedAt: new Date().toISOString() } : {}),
      ...(status === "running" ? { lastRunAt: new Date().toISOString() } : {}),
    }),

  setArchived: (id, archived) => get().updateCampaign(id, { archived }),
}));
