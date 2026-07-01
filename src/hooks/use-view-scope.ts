"use client";

import { useCallback, useMemo } from "react";
import {
  CURRENT_REP,
  useViewLevelStore,
  type ViewLevel,
} from "@/lib/stores/view-level-store";
import {
  filterCasesByView,
  filterContactsByView,
  filterDocumentsByView,
  filterEnvelopesByView,
  filterInboxByView,
  filterWorkQueueByView,
  isAdminView,
  isRepView,
  scopeLabel,
  scopedTitle,
} from "@/lib/view-scope";
import type {
  CaseRecord,
  ContactRecord,
  DocumentRecord,
  EsignEnvelope,
  InboxMessage,
  WorkQueueItem,
} from "@/lib/types";

export function useViewScope() {
  const level = useViewLevelStore((s) => s.level);

  const filterContacts = useCallback(
    (contacts: ContactRecord[]) => filterContactsByView(contacts, level),
    [level]
  );

  const filterWorkQueue = useCallback(
    (items: WorkQueueItem[]) => filterWorkQueueByView(items, level),
    [level]
  );

  const filterCases = useCallback(
    (cases: CaseRecord[]) => filterCasesByView(cases, level),
    [level]
  );

  const filterDocuments = useCallback(
    (docs: DocumentRecord[]) => filterDocumentsByView(docs, level),
    [level]
  );

  const filterEnvelopes = useCallback(
    (envelopes: EsignEnvelope[]) => filterEnvelopesByView(envelopes, level),
    [level]
  );

  const filterInbox = useCallback(
    (messages: InboxMessage[]) => filterInboxByView(messages, level),
    [level]
  );

  const title = useCallback(
    (label: string) => scopedTitle(level, label),
    [level]
  );

  return useMemo(
    () => ({
      level,
      isAdmin: isAdminView(level),
      isRep: isRepView(level),
      scopeLabel: scopeLabel(level),
      rep: CURRENT_REP,
      filterContacts,
      filterWorkQueue,
      filterCases,
      filterDocuments,
      filterEnvelopes,
      filterInbox,
      title,
    }),
    [
      level,
      filterContacts,
      filterWorkQueue,
      filterCases,
      filterDocuments,
      filterEnvelopes,
      filterInbox,
      title,
    ]
  );
}

export type ViewScope = ReturnType<typeof useViewScope>;
