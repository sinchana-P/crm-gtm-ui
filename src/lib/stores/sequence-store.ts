"use client";

import { create } from "zustand";
import type { Sequence, SequenceEnrollment } from "@/lib/types";
import { MOCK_SEQUENCES, MOCK_SEQUENCE_ENROLLMENTS } from "@/lib/mock-data";

/** ID helpers live outside components (React Compiler purity forbids Date.now in render). */
export function createSequenceId() {
  return `s${Date.now()}`;
}
let stepCounter = 0;
export function createStepId() {
  stepCounter += 1;
  return `stp-${Date.now()}-${stepCounter}`;
}

interface SequenceState {
  sequences: Sequence[];
  enrollments: SequenceEnrollment[];
  addSequence: (sequence: Sequence) => void;
  updateSequence: (id: string, patch: Partial<Sequence>) => void;
  duplicateSequence: (id: string) => Sequence | undefined;
  setStatus: (id: string, status: Sequence["status"]) => void;
  setArchived: (id: string, archived: boolean) => void;
  deleteSequence: (id: string) => void;
}

export const useSequenceStore = create<SequenceState>()((set, get) => ({
  sequences: MOCK_SEQUENCES,
  enrollments: MOCK_SEQUENCE_ENROLLMENTS,

  addSequence: (sequence) => set((s) => ({ sequences: [sequence, ...s.sequences] })),

  updateSequence: (id, patch) =>
    set((s) => ({
      sequences: s.sequences.map((seq) =>
        seq.id === id
          ? { ...seq, ...patch, updatedAt: new Date().toISOString() }
          : seq
      ),
    })),

  duplicateSequence: (id) => {
    const source = get().sequences.find((s) => s.id === id);
    if (!source) return undefined;
    const copy: Sequence = {
      ...source,
      id: createSequenceId(),
      name: `${source.name} (Copy)`,
      status: "draft",
      archived: false,
      enrolled: 0,
      activeCount: 0,
      completed: 0,
      exitedCount: 0,
      replied: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ sequences: [copy, ...s.sequences] }));
    return copy;
  },

  setStatus: (id, status) => get().updateSequence(id, { status }),

  setArchived: (id, archived) => get().updateSequence(id, { archived }),

  deleteSequence: (id) =>
    set((s) => ({ sequences: s.sequences.filter((seq) => seq.id !== id) })),
}));
