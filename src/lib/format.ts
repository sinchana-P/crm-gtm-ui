import { format, formatDistanceToNow } from "date-fns";
import type { CaseRecord, EsignEnvelope } from "@/lib/types";

export function formatDate(iso: string) {
  return format(new Date(iso), "MMM d, yyyy");
}

export function formatDateTime(iso: string) {
  return format(new Date(iso), "MMM d, yyyy h:mm a");
}

export function formatRelative(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function contactName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

export function slaUrgencyScore(caseRecord: CaseRecord) {
  const weights = { red: 3, amber: 2, green: 1 };
  const dueMs = new Date(caseRecord.slaDue).getTime() - Date.now();
  return weights[caseRecord.slaStatus] * 1000 - dueMs;
}

export function priorityLabel(priority: CaseRecord["priority"]) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function statusLabel(status: CaseRecord["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function envelopeStatusLabel(status: EsignEnvelope["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
