"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewLevel = "admin" | "representative" | "customer-portal";

export const CURRENT_REP = {
  id: "u1",
  name: "Priya Sharma",
  email: "priya@connectcrm.in",
  initials: "PS",
  territory: "South",
};

interface ViewLevelState {
  level: ViewLevel;
  setLevel: (level: ViewLevel) => void;
}

export const useViewLevelStore = create<ViewLevelState>()(
  persist(
    (set) => ({
      level: "admin",
      setLevel: (level) => set({ level }),
    }),
    { name: "connect-crm-view-level" }
  )
);
