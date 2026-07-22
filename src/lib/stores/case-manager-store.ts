"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CM_CASES,
  CM_INTAKE,
  CM_PROJECTS,
  CM_QUEUES,
} from "@/lib/mock-data/case-manager";
import { useIntegrationStore } from "@/lib/stores/integration-store";
import type { PortalRequestStatus } from "@/lib/types/portal";
import type {
  CaseSource,
  CmCase,
  CmCaseStatus,
  CmCustomField,
  CmPriority,
  CmTimelineEvent,
  IntakeItem,
} from "@/lib/types/case-manager";

/** Input for converting an intake item / CRM record into a case. */
export interface ConvertInput {
  intakeId?: string;
  contactId?: string;
  /** Anonymous inquiry path — create a CRM lead/contact first. */
  newContact?: { name: string; email: string };
  title: string;
  description: string;
  projectId: string;
  queueId: string;
  assignee: string;
  priority: CmPriority;
  caseType: string;
  customFields: CmCustomField[];
  source: CaseSource;
  sourceRef?: string;
}

interface CmStoreState {
  cases: CmCase[];
  intake: IntakeItem[];
  /** Synthetic CRM Contact-360 events written back when cases progress. */
  contactEvents: Record<string, CmTimelineEvent[]>;
  /** Portal request status reflections keyed by request number. */
  portalOverrides: Record<string, PortalRequestStatus>;
  seq: number;

  convertToCase: (input: ConvertInput) => CmCase;
  addIntakeFromPortal: (input: {
    subject: string;
    body: string;
    contactId?: string;
    submitterName: string;
    submitterEmail: string;
    priority: CmPriority;
    sourceRef: string;
  }) => IntakeItem;
  markIntakeResponded: (id: string) => void;
  dismissIntake: (id: string) => void;

  updateCaseStatus: (id: string, status: CmCaseStatus, actor?: string) => void;
  reassignCase: (id: string, assignee: string) => void;
  addComment: (id: string, body: string, actor?: string) => void;
  escalateCase: (id: string, tier: 1 | 2 | 3, note: string) => void;
  resolveCase: (id: string, note: string, csat?: number) => void;
  handbackToSales: (
    id: string,
    kind: "opportunity" | "task",
    note: string
  ) => void;
}

const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

function withEvent(c: CmCase, ev: Omit<CmTimelineEvent, "id">): CmCase {
  return {
    ...c,
    updatedAt: ev.createdAt,
    timeline: [...c.timeline, { ...ev, id: uid("ev") }],
  };
}

export const useCaseManagerStore = create<CmStoreState>()(
  persist(
    (set, get) => ({
  cases: CM_CASES,
  intake: CM_INTAKE,
  contactEvents: {},
  portalOverrides: {},
  seq: 200,

  convertToCase: (input) => {
    const project = CM_PROJECTS.find((p) => p.id === input.projectId);
    const queue = CM_QUEUES.find((q) => q.id === input.queueId);
    const seq = get().seq + 1;
    const prefix = project?.displayId ?? "CAS";
    const displayId = `${prefix}-2607-${String(seq).padStart(4, "0")}`;
    const contactId = input.contactId;
    const createdAt = now();

    const newCase: CmCase = {
      id: uid("cmc"),
      displayId,
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      projectName: project?.name ?? "—",
      queueId: input.queueId,
      queueName: queue?.name ?? "—",
      caseType: input.caseType,
      status: "New",
      priority: input.priority,
      assignee: input.assignee,
      watchers: [],
      clientIds: contactId ? [contactId] : [],
      slaDue: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      slaStatus: "green",
      source: input.source,
      sourceRef: input.sourceRef,
      createdAt,
      updatedAt: createdAt,
      customFields: input.customFields,
      tasks: [],
      documents: [],
      linkedCaseIds: [],
      timeline: [
        {
          id: uid("ev"),
          type: "created",
          title: `Case created${input.sourceRef ? ` from ${input.sourceRef}` : ""}`,
          actor: "You",
          createdAt,
        },
        ...(input.newContact
          ? [
              {
                id: uid("ev"),
                type: "sync" as const,
                title: "New contact created in Connect CRM",
                body: `${input.newContact.name} · ${input.newContact.email}`,
                actor: "System",
                createdAt,
              },
            ]
          : contactId
          ? [
              {
                id: uid("ev"),
                type: "sync" as const,
                title: "Contact linked from Connect CRM",
                actor: "System",
                createdAt,
              },
            ]
          : []),
      ],
    };

    // Cross-store: log the sync.
    useIntegrationStore.getState().addSyncLog({
      id: uid("sl"),
      direction: "crm_to_cm",
      entity: input.source === "inquiry" ? "Inquiry" : "Request",
      recordLabel: `${displayId} · ${input.title}`,
      action: "create",
      status: "success",
      at: createdAt,
      detail: `Converted from ${input.sourceRef ?? input.source}`,
    });

    set((s) => {
      const contactEvents = { ...s.contactEvents };
      if (contactId) {
        const ev: CmTimelineEvent = {
          id: uid("ev"),
          type: "created",
          title: `Case ${displayId} opened`,
          body: input.title,
          actor: "You",
          createdAt,
        };
        contactEvents[contactId] = [ev, ...(contactEvents[contactId] ?? [])];
      }
      return {
        seq,
        cases: [newCase, ...s.cases],
        contactEvents,
        intake: input.intakeId
          ? s.intake.map((i) =>
              i.id === input.intakeId
                ? { ...i, status: "Converted", caseId: newCase.id }
                : i
            )
          : s.intake,
      };
    });

    return newCase;
  },

  addIntakeFromPortal: (input) => {
    const item: IntakeItem = {
      id: uid("in"),
      channel: "portal",
      status: "New",
      subject: input.subject,
      body: input.body,
      submitterName: input.submitterName,
      submitterEmail: input.submitterEmail,
      linkedContactId: input.contactId,
      priority: input.priority,
      receivedAt: now(),
      sourceRef: input.sourceRef,
    };
    useIntegrationStore.getState().addSyncLog({
      id: uid("sl"),
      direction: "crm_to_cm",
      entity: "Request",
      recordLabel: `${input.sourceRef} · ${input.subject}`,
      action: "create",
      status: "pending",
      at: item.receivedAt,
      detail: "Awaiting triage",
    });
    set((s) => ({ intake: [item, ...s.intake] }));
    return item;
  },

  markIntakeResponded: (id) =>
    set((s) => ({
      intake: s.intake.map((i) =>
        i.id === id ? { ...i, status: "Responded" } : i
      ),
    })),

  dismissIntake: (id) =>
    set((s) => ({
      intake: s.intake.map((i) => (i.id === id ? { ...i, status: "Closed" } : i)),
    })),

  updateCaseStatus: (id, status, actor = "You") =>
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? withEvent(c, {
              type: "status",
              title: `Status changed to ${status}`,
              actor,
              createdAt: now(),
            })
          : c
      ).map((c) => (c.id === id ? { ...c, status } : c)),
    })),

  reassignCase: (id, assignee) =>
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...withEvent(c, {
                type: "assignment",
                title: `Reassigned to ${assignee}`,
                actor: "You",
                createdAt: now(),
              }),
              assignee,
            }
          : c
      ),
    })),

  addComment: (id, body, actor = "You") =>
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? withEvent(c, { type: "comment", title: "Comment added", body, actor, createdAt: now() })
          : c
      ),
    })),

  escalateCase: (id, tier, note) => {
    const at = now();
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...withEvent(c, {
                type: "escalation",
                title: `Escalated to Tier ${tier} — account owner notified`,
                body: note,
                actor: "You",
                createdAt: at,
              }),
              escalationTier: tier,
              slaStatus: "red",
            }
          : c
      ),
    }));
    const c = get().cases.find((x) => x.id === id);
    useIntegrationStore.getState().addSyncLog({
      id: uid("sl"),
      direction: "cm_to_crm",
      entity: "Case",
      recordLabel: `${c?.displayId} · ${c?.title}`,
      action: "escalate",
      status: "success",
      at,
      detail: `Escalated to Tier ${tier}`,
    });
  },

  resolveCase: (id, note, csat) => {
    const at = now();
    const target = get().cases.find((c) => c.id === id);
    set((s) => {
      const portalOverrides = { ...s.portalOverrides };
      const contactEvents = { ...s.contactEvents };
      if (target?.sourceRef && target.source === "portal") {
        portalOverrides[target.sourceRef] = "resolved";
      }
      target?.clientIds.forEach((cid) => {
        const ev: CmTimelineEvent = {
          id: uid("ev"),
          type: "resolved",
          title: `Case ${target.displayId} resolved`,
          body: note,
          actor: "You",
          createdAt: at,
        };
        contactEvents[cid] = [ev, ...(contactEvents[cid] ?? [])];
      });
      return {
        portalOverrides,
        contactEvents,
        cases: s.cases.map((c) =>
          c.id === id
            ? {
                ...withEvent(c, {
                  type: "resolved",
                  title: "Case resolved",
                  body: note,
                  actor: "You",
                  createdAt: at,
                }),
                status: "Resolved",
                csatScore: csat,
              }
            : c
        ),
      };
    });
    if (target?.sourceRef && target.source === "portal") {
      useIntegrationStore.getState().addSyncLog({
        id: uid("sl"),
        direction: "cm_to_crm",
        entity: "Case",
        recordLabel: `${target.displayId} · ${target.title}`,
        action: "resolve",
        status: "success",
        at,
        detail: `Portal request ${target.sourceRef} marked resolved`,
      });
    }
  },

  handbackToSales: (id, kind, note) => {
    const at = now();
    const target = get().cases.find((c) => c.id === id);
    const ref = kind === "opportunity" ? uid("OPP").toUpperCase() : uid("TASK").toUpperCase();
    set((s) => {
      const contactEvents = { ...s.contactEvents };
      target?.clientIds.forEach((cid) => {
        const ev: CmTimelineEvent = {
          id: uid("ev"),
          type: "handback",
          title: kind === "opportunity" ? "Opportunity created from case" : "Follow-up task created",
          body: note,
          actor: "You",
          createdAt: at,
        };
        contactEvents[cid] = [ev, ...(contactEvents[cid] ?? [])];
      });
      return {
        contactEvents,
        cases: s.cases.map((c) =>
          c.id === id
            ? {
                ...withEvent(c, {
                  type: "handback",
                  title: kind === "opportunity" ? "Handed back to sales — opportunity created" : "Handed back to sales — task created",
                  body: note,
                  actor: "You",
                  createdAt: at,
                }),
                handbackRef: ref,
              }
            : c
        ),
      };
    });
  },
    }),
    {
      name: "connect-crm-case-manager",
      version: 1,
      partialize: (s) => ({
        cases: s.cases,
        intake: s.intake,
        contactEvents: s.contactEvents,
        portalOverrides: s.portalOverrides,
        seq: s.seq,
      }),
    }
  )
);
