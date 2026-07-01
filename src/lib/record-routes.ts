import type { ContactRecord } from "@/lib/types";

export type RecordEntityType = ContactRecord["type"];

const ENTITY_LIST_PATH: Record<RecordEntityType, string> = {
  lead: "/leads",
  contact: "/contacts",
  customer: "/customers",
};

const ENTITY_LABEL: Record<RecordEntityType, string> = {
  lead: "Lead",
  contact: "Contact",
  customer: "Customer",
};

export function getRecordHref(
  contact: Pick<ContactRecord, "id" | "type"> | { id: string; type: RecordEntityType }
) {
  const segment =
    contact.type === "lead"
      ? "leads"
      : contact.type === "customer"
        ? "customers"
        : "contacts";
  return `/${segment}/${contact.id}`;
}

export function getRecordListHref(type: RecordEntityType) {
  return ENTITY_LIST_PATH[type];
}

export function getRecordEntityLabel(type: RecordEntityType) {
  return ENTITY_LABEL[type];
}
