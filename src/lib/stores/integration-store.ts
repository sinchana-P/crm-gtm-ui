"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_CONNECTION,
  FIELD_MAPPINGS,
  PRIORITY_VALUE_MAP,
  STATUS_VALUE_MAP,
  SYNC_LOG,
} from "@/lib/mock-data/case-manager";
import type {
  ConflictRule,
  FieldMapping,
  IntegrationConnection,
  SyncDirection,
  SyncLogEntry,
  ValueMapping,
} from "@/lib/types/case-manager";

interface IntegrationState {
  connection: IntegrationConnection;
  fieldMappings: FieldMapping[];
  statusMap: ValueMapping[];
  priorityMap: ValueMapping[];
  syncLog: SyncLogEntry[];
  connect: () => void;
  disconnect: () => void;
  acceptCmToken: () => void;
  regenerateApiKey: () => void;
  setSyncDirection: (direction: SyncDirection) => void;
  setConflictRule: (rule: ConflictRule) => void;
  toggleAutoConvert: () => void;
  toggleSyncResolution: () => void;
  addSyncLog: (entry: SyncLogEntry) => void;
}

function randomKey() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `cnx_live_${s}••••••••••••${chars[0]}${chars[1]}${chars[2]}${chars[3]}`;
}

export const useIntegrationStore = create<IntegrationState>()(
  persist(
    (set) => ({
      connection: DEFAULT_CONNECTION,
      fieldMappings: FIELD_MAPPINGS,
      statusMap: STATUS_VALUE_MAP,
      priorityMap: PRIORITY_VALUE_MAP,
      syncLog: SYNC_LOG,
      connect: () =>
        set((s) => ({
          connection: {
            ...s.connection,
            connected: true,
            cmTokenAccepted: true,
            crmApiKey: s.connection.crmApiKey ?? randomKey(),
            lastSyncAt: new Date().toISOString(),
          },
        })),
      disconnect: () =>
        set((s) => ({
          connection: {
            ...s.connection,
            connected: false,
            cmTokenAccepted: false,
            crmApiKey: undefined,
          },
        })),
      acceptCmToken: () =>
        set((s) => ({ connection: { ...s.connection, cmTokenAccepted: true } })),
      regenerateApiKey: () =>
        set((s) => ({ connection: { ...s.connection, crmApiKey: randomKey() } })),
      setSyncDirection: (syncDirection) =>
        set((s) => ({ connection: { ...s.connection, syncDirection } })),
      setConflictRule: (conflictRule) =>
        set((s) => ({ connection: { ...s.connection, conflictRule } })),
      toggleAutoConvert: () =>
        set((s) => ({
          connection: {
            ...s.connection,
            autoConvertInquiries: !s.connection.autoConvertInquiries,
          },
        })),
      toggleSyncResolution: () =>
        set((s) => ({
          connection: {
            ...s.connection,
            syncResolutionToPortal: !s.connection.syncResolutionToPortal,
          },
        })),
      addSyncLog: (entry) => set((s) => ({ syncLog: [entry, ...s.syncLog] })),
    }),
    { name: "connect-crm-integration" }
  )
);
