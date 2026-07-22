"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Which top-level product shell is active. */
export type Workspace = "crm" | "case-manager";

interface WorkspaceState {
  workspace: Workspace;
  setWorkspace: (workspace: Workspace) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspace: "crm",
      setWorkspace: (workspace) => set({ workspace }),
    }),
    { name: "connect-crm-workspace" }
  )
);
