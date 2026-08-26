"use client";

import { create } from "zustand";
import {
  SEED_ENROLLMENTS,
  type EnrollKind,
  type EnrollStatus,
  type EnrollmentRow,
} from "@/lib/mock-data/enrollments";

let counter = 0;
function newId() {
  counter += 1;
  return `enr-${counter}-${Math.random().toString(36).slice(2, 6)}`;
}

interface EnrollmentState {
  rows: EnrollmentRow[];
  /** Enroll many contacts into one target. Skips duplicates (already active/paused). */
  enroll: (contactIds: string[], kind: EnrollKind, targetId: string, firstStep: string) => number;
  unenroll: (id: string) => void;
  setStatus: (id: string, status: EnrollStatus) => void;
}

export const useEnrollmentStore = create<EnrollmentState>()((set, get) => ({
  rows: SEED_ENROLLMENTS,
  enroll: (contactIds, kind, targetId, firstStep) => {
    const existing = get().rows;
    const already = new Set(
      existing
        .filter((r) => r.kind === kind && r.targetId === targetId && (r.status === "active" || r.status === "paused"))
        .map((r) => r.contactId),
    );
    const fresh = contactIds
      .filter((cid) => !already.has(cid))
      .map<EnrollmentRow>((cid) => ({
        id: newId(),
        contactId: cid,
        kind,
        targetId,
        status: "active",
        step: firstStep,
        enrolledAt: "just now",
      }));
    if (fresh.length) set({ rows: [...fresh, ...existing] });
    return fresh.length;
  },
  unenroll: (id) => set((s) => ({ rows: s.rows.map((r) => (r.id === id ? { ...r, status: "exited" } : r)) })),
  setStatus: (id, status) => set((s) => ({ rows: s.rows.map((r) => (r.id === id ? { ...r, status } : r)) })),
}));

/* ---- selectors (call with the rows array) ---- */
export const isLive = (r: EnrollmentRow) => r.status === "active" || r.status === "paused";
export function countFor(rows: EnrollmentRow[], kind: EnrollKind, targetId: string) {
  const list = rows.filter((r) => r.kind === kind && r.targetId === targetId);
  return {
    total: list.length,
    active: list.filter((r) => r.status === "active").length,
    paused: list.filter((r) => r.status === "paused").length,
    completed: list.filter((r) => r.status === "completed").length,
    exited: list.filter((r) => r.status === "exited").length,
    replied: list.filter((r) => r.replied).length,
  };
}
export function membershipsOf(rows: EnrollmentRow[], contactId: string) {
  return rows.filter((r) => r.contactId === contactId);
}
