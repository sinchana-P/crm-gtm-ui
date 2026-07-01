import type { ViewLevel } from "@/lib/stores/view-level-store";
import { CURRENT_REP } from "@/lib/stores/view-level-store";
import type {
  CaseRecord,
  ContactRecord,
  DocumentRecord,
  EsignEnvelope,
  InboxMessage,
  WorkQueueItem,
} from "@/lib/types";
import { MOCK_CONTACTS } from "@/lib/mock-data";

/** Nav items visible only in admin view */
export const ADMIN_ONLY_NAV_IDS = new Set([
  "duplicates",
  "import",
  "reports",
  "mkt-dashboard",
  "campaigns",
  "segments",
  "calendar",
  "deliverability",
  "automations",
  "case-templates",
  "esign-bulk",
  "esign-templates",
  "settings-plugins",
  "settings-assignment",
  "settings-scoring",
  "settings-fields",
  "settings-consent",
  "settings-integrations",
  "settings-whatsapp",
]);

/** Routes that redirect representatives to dashboard */
export const ADMIN_ONLY_PATHS = [
  "/duplicates",
  "/import",
  "/reports",
  "/marketing/deliverability",
  "/marketing/automations",
  "/marketing/campaigns",
  "/marketing/segments",
  "/marketing/calendar",
  "/cases/templates",
  "/esign/bulk",
  "/esign/templates",
  "/settings/plugins",
  "/settings/assignment",
  "/settings/scoring",
  "/settings/fields",
  "/settings/consent",
  "/settings/integrations",
  "/settings/whatsapp",
];

export function isAdminView(level: ViewLevel) {
  return level === "admin";
}

export function isRepView(level: ViewLevel) {
  return level === "representative";
}

export function isPortalView(level: ViewLevel) {
  return level === "customer-portal";
}

export function scopeLabel(level: ViewLevel) {
  return isAdminView(level) ? "Organization" : "Assigned";
}

export function repContactIds(): Set<string> {
  return new Set(
    MOCK_CONTACTS.filter((c) => c.owner === CURRENT_REP.name).map((c) => c.id)
  );
}

export function filterContactsByView(
  contacts: ContactRecord[],
  level: ViewLevel
): ContactRecord[] {
  if (isAdminView(level)) return contacts;
  return contacts.filter((c) => c.owner === CURRENT_REP.name);
}

export function filterWorkQueueByView(
  items: WorkQueueItem[],
  level: ViewLevel
): WorkQueueItem[] {
  if (isAdminView(level)) return items;
  return items.filter((item) => item.owner === CURRENT_REP.name);
}

export function filterCasesByView(
  cases: CaseRecord[],
  level: ViewLevel
): CaseRecord[] {
  if (isAdminView(level)) return cases;
  const ids = repContactIds();
  return cases.filter((c) => ids.has(c.contactId));
}

export function filterDocumentsByView(
  docs: DocumentRecord[],
  level: ViewLevel
): DocumentRecord[] {
  if (isAdminView(level)) return docs;
  const ids = repContactIds();
  return docs.filter((d) => ids.has(d.contactId));
}

export function filterEnvelopesByView(
  envelopes: EsignEnvelope[],
  level: ViewLevel
): EsignEnvelope[] {
  if (isAdminView(level)) return envelopes;
  const ids = repContactIds();
  return envelopes.filter((e) => ids.has(e.contactId));
}

export function filterInboxByView(
  messages: InboxMessage[],
  level: ViewLevel
): InboxMessage[] {
  if (isAdminView(level)) return messages;
  return messages.filter((m) => m.assignee === CURRENT_REP.name);
}

export function filterWhatsAppThreadsByView<T extends { assignee: string }>(
  threads: T[],
  level: ViewLevel
): T[] {
  if (isAdminView(level)) return threads;
  return threads.filter((t) => t.assignee === CURRENT_REP.name);
}

export function scopedTitle(_level: ViewLevel, label: string): string {
  return label;
}

export function navLabelForItem(
  _itemId: string,
  label: string,
  _level: ViewLevel
): string {
  return label;
}
