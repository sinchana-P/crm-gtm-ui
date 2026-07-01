export type WhatsAppTemplateCategory = "marketing" | "utility" | "authentication";

export type WhatsAppTemplateStatus = "approved" | "pending" | "rejected";

export type WhatsAppMessageDirection = "inbound" | "outbound";

export type WhatsAppMessageType =
  | "text"
  | "template"
  | "image"
  | "document"
  | "button"
  | "location";

export type WhatsAppThreadStatus = "open" | "pending" | "resolved" | "snoozed";

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: WhatsAppTemplateCategory;
  status: WhatsAppTemplateStatus;
  language: string;
  body: string;
  variables: string[];
  buttons?: { label: string; type: "url" | "quick_reply" }[];
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  direction: WhatsAppMessageDirection;
  type: WhatsAppMessageType;
  body: string;
  templateName?: string;
  sentAt: string;
  status?: "sent" | "delivered" | "read" | "failed";
  actor?: string;
}

export interface WhatsAppThread {
  id: string;
  contactId: string;
  contactName: string;
  phone: string;
  assignee: string;
  status: WhatsAppThreadStatus;
  unread: boolean;
  lastMessageAt: string;
  sessionOpen: boolean;
  sessionExpiresAt?: string;
  tags: string[];
  source?: string;
  messages: WhatsAppMessage[];
}

export interface WhatsAppBotFlow {
  id: string;
  name: string;
  status: "active" | "draft" | "paused";
  trigger: string;
  description: string;
  steps: number;
  handoffs: number;
  completionRate: number;
}

export interface WhatsAppBroadcast {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  segmentName: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused";
  scheduledAt?: string;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  failed: number;
}

export interface WhatsAppStats {
  threadsOpen: number;
  unread: number;
  avgFirstResponseMin: number;
  deliveryRate: number;
  readRate: number;
  replyRate: number;
  leadsFromWa: number;
  templatesActive: number;
}

export interface WhatsAppBusinessConfig {
  phoneNumber: string;
  displayName: string;
  businessId: string;
  provider: string;
  webhookStatus: "healthy" | "degraded" | "down";
  qualityRating: "green" | "yellow" | "red";
  messagingLimit: string;
  lastSync: string;
}

export interface PortalWhatsAppMessage {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  sentAt: string;
  senderName: string;
  read: boolean;
}
