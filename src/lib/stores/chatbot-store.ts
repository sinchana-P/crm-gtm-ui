"use client";

import { create } from "zustand";
import type { Chatbot } from "@/lib/types";
import { MOCK_CHATBOTS } from "@/lib/mock-data/chatbot";

export function createChatbotId() {
  return `cb${Date.now()}`;
}
let idCounter = 0;
export function createChatbotChildId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

interface ChatbotState {
  chatbots: Chatbot[];
  addChatbot: (bot: Chatbot) => void;
  updateChatbot: (id: string, patch: Partial<Chatbot>) => void;
  duplicateChatbot: (id: string) => Chatbot | undefined;
  setStatus: (id: string, status: Chatbot["status"]) => void;
  setArchived: (id: string, archived: boolean) => void;
  deleteChatbot: (id: string) => void;
}

export const useChatbotStore = create<ChatbotState>()((set, get) => ({
  chatbots: MOCK_CHATBOTS,

  addChatbot: (bot) => set((s) => ({ chatbots: [bot, ...s.chatbots] })),

  updateChatbot: (id, patch) =>
    set((s) => ({
      chatbots: s.chatbots.map((b) =>
        b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b
      ),
    })),

  duplicateChatbot: (id) => {
    const src = get().chatbots.find((b) => b.id === id);
    if (!src) return undefined;
    const copy: Chatbot = {
      ...src,
      id: createChatbotId(),
      name: `${src.name} (Copy)`,
      status: "draft",
      archived: false,
      conversations: 0,
      resolvedByBot: 0,
      leadsCaptured: 0,
      handoffs: 0,
      deflectionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ chatbots: [copy, ...s.chatbots] }));
    return copy;
  },

  setStatus: (id, status) => get().updateChatbot(id, { status }),
  setArchived: (id, archived) => get().updateChatbot(id, { archived }),
  deleteChatbot: (id) => set((s) => ({ chatbots: s.chatbots.filter((b) => b.id !== id) })),
}));
