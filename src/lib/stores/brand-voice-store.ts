"use client";

import { create } from "zustand";
import type { BrandVoice } from "@/lib/types";
import { DEFAULT_BRAND_VOICE } from "@/lib/mock-data/ai-email";

interface BrandVoiceState {
  voice: BrandVoice;
  setVoice: (patch: Partial<BrandVoice>) => void;
  reset: () => void;
}

export const useBrandVoiceStore = create<BrandVoiceState>()((set) => ({
  voice: DEFAULT_BRAND_VOICE,
  setVoice: (patch) => set((s) => ({ voice: { ...s.voice, ...patch } })),
  reset: () => set({ voice: DEFAULT_BRAND_VOICE }),
}));
