export type PortalActionType =
  | "upload_document"
  | "complete_form"
  | "sign_document"
  | "complete_survey"
  | "respond_request"
  | "update_profile";

export type PortalRequestStatus =
  | "new"
  | "open"
  | "pending"
  | "resolved"
  | "closed";

export interface PortalCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title?: string;
  accountOwner: string;
  accountOwnerEmail: string;
  territory: string;
  memberSince: string;
  avatarInitials: string;
}

export interface PortalActionItem {
  id: string;
  type: PortalActionType;
  title: string;
  description: string;
  dueAt?: string;
  priority: "low" | "medium" | "high" | "urgent";
  href: string;
}

export interface PortalActivityItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type: "case" | "document" | "form" | "esign" | "survey" | "profile";
}

export interface PortalRequest {
  id: string;
  number: string;
  title: string;
  type: string;
  status: PortalRequestStatus;
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
  createdAt: string;
  updatedAt: string;
  assignee: string;
  slaDue?: string;
  requiredFields?: PortalInfoField[];
  formIds?: string[];
  timeline: PortalRequestEvent[];
}

export interface PortalRequestEvent {
  id: string;
  title: string;
  body?: string;
  actor: string;
  createdAt: string;
  type: "created" | "status" | "comment" | "assignment" | "document" | "resolved";
}

export interface PortalInfoField {
  key: string;
  label: string;
  type: "text" | "date" | "attachment" | "textarea";
  required: boolean;
}

export interface PortalDocument {
  id: string;
  name: string;
  category: "shared" | "uploaded" | "requested" | "signed";
  type: string;
  size: string;
  uploadedAt: string;
  status?: "received" | "pending" | "rejected" | "approved";
  requestedBy?: string;
  dueAt?: string;
  instructions?: string;
}

export interface PortalFormAssignment {
  id: string;
  name: string;
  description: string;
  status: "pending" | "submitted" | "draft";
  dueAt?: string;
  submittedAt?: string;
  fields: number;
  progress?: number;
}

export interface PortalSignature {
  id: string;
  name: string;
  status: "pending" | "viewed" | "signed" | "declined" | "expired";
  sentAt: string;
  expiresAt?: string;
  signedAt?: string;
  signers: number;
  signed: number;
}

export interface PortalSurvey {
  id: string;
  name: string;
  type: "nps" | "csat" | "feedback" | "onboarding";
  status: "pending" | "completed";
  dueAt?: string;
  completedAt?: string;
  questions: number;
}

export interface PortalNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

export interface PortalNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface PortalPreferences {
  email: boolean;
  whatsapp: boolean;
  sms: boolean;
  topics: string[];
  digest: "instant" | "daily";
}
