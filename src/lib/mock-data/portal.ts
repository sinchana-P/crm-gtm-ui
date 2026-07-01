import type {
  PortalActionItem,
  PortalActivityItem,
  PortalCustomer,
  PortalDocument,
  PortalFormAssignment,
  PortalNotification,
  PortalPreferences,
  PortalRequest,
  PortalSignature,
  PortalSurvey,
} from "@/lib/types/portal";

export const PORTAL_CUSTOMER: PortalCustomer = {
  id: "c1",
  firstName: "Ananya",
  lastName: "Iyer",
  email: "ananya.iyer@techcorp.in",
  phone: "+91 98765 43210",
  company: "TechCorp India",
  title: "Procurement Head",
  accountOwner: "Priya Sharma",
  accountOwnerEmail: "priya@connectcrm.in",
  territory: "South",
  memberSince: "2026-05-12T10:00:00Z",
  avatarInitials: "AI",
};

export const PORTAL_PREFERENCES: PortalPreferences = {
  email: true,
  whatsapp: true,
  sms: false,
  topics: ["product-updates", "service-notices"],
  digest: "instant",
};

export const PORTAL_ACTIONS: PortalActionItem[] = [
  {
    id: "pa1",
    type: "upload_document",
    title: "Upload company PAN card",
    description: "Required for vendor onboarding — PDF or JPG, max 5 MB.",
    dueAt: "2026-06-28T18:00:00Z",
    priority: "high",
    href: "/portal/documents?tab=requested",
  },
  {
    id: "pa2",
    type: "sign_document",
    title: "Sign mutual NDA",
    description: "Legal review complete. Signature needed before demo access.",
    dueAt: "2026-06-30T18:00:00Z",
    priority: "urgent",
    href: "/portal/signatures",
  },
  {
    id: "pa3",
    type: "complete_form",
    title: "Complete onboarding questionnaire",
    description: "12 fields · saves progress automatically.",
    dueAt: "2026-06-27T18:00:00Z",
    priority: "medium",
    href: "/portal/forms",
  },
  {
    id: "pa4",
    type: "complete_survey",
    title: "Rate your support experience",
    description: "2-minute CSAT survey for case CM-1051.",
    priority: "low",
    href: "/portal/surveys",
  },
  {
    id: "pa5",
    type: "respond_request",
    title: "Provide demo environment details",
    description: "Your rep requested IP allowlist and admin contact.",
    dueAt: "2026-06-26T12:00:00Z",
    priority: "high",
    href: "/portal/requests/pr1",
  },
];

export const PORTAL_REQUESTS: PortalRequest[] = [
  {
    id: "pr1",
    number: "CM-1051",
    title: "Demo access not received",
    type: "Technical support",
    status: "open",
    priority: "urgent",
    description:
      "Submitted demo request last week. Credentials not received. Need access for security review.",
    createdAt: "2026-06-20T09:00:00Z",
    updatedAt: "2026-06-24T08:30:00Z",
    assignee: "Priya Sharma",
    slaDue: "2026-06-26T12:00:00Z",
    requiredFields: [
      { key: "admin_email", label: "Admin contact email", type: "text", required: true },
      { key: "ip_range", label: "IP allowlist (CIDR)", type: "text", required: true },
      {
        key: "security_doc",
        label: "Security questionnaire (if available)",
        type: "attachment",
        required: false,
      },
    ],
    formIds: ["pf1"],
    timeline: [
      {
        id: "te1",
        type: "created",
        title: "Request created",
        body: "Opened from customer portal.",
        actor: "Ananya Iyer",
        createdAt: "2026-06-20T09:00:00Z",
      },
      {
        id: "te2",
        type: "assignment",
        title: "Assigned to Priya Sharma",
        actor: "System",
        createdAt: "2026-06-20T09:05:00Z",
      },
      {
        id: "te3",
        type: "comment",
        title: "Additional information requested",
        body: "Please share admin email and IP allowlist for sandbox provisioning.",
        actor: "Priya Sharma",
        createdAt: "2026-06-24T08:30:00Z",
      },
    ],
  },
  {
    id: "pr2",
    number: "CM-1048",
    title: "Invoice copy for Q1",
    type: "Billing",
    status: "resolved",
    priority: "medium",
    description: "Need duplicate tax invoice for accounts payable.",
    createdAt: "2026-06-10T11:00:00Z",
    updatedAt: "2026-06-12T16:00:00Z",
    assignee: "Arjun Mehta",
    timeline: [
      {
        id: "te4",
        type: "created",
        title: "Request created",
        actor: "Ananya Iyer",
        createdAt: "2026-06-10T11:00:00Z",
      },
      {
        id: "te5",
        type: "document",
        title: "Invoice attached",
        body: "Q1 tax invoice uploaded to your document vault.",
        actor: "Arjun Mehta",
        createdAt: "2026-06-12T16:00:00Z",
      },
      {
        id: "te6",
        type: "resolved",
        title: "Marked resolved",
        actor: "Arjun Mehta",
        createdAt: "2026-06-12T16:05:00Z",
      },
    ],
  },
  {
    id: "pr3",
    number: "CM-1055",
    title: "Add second portal user",
    type: "Account",
    status: "pending",
    priority: "low",
    description: "Request access for colleague in finance team.",
    createdAt: "2026-06-23T14:00:00Z",
    updatedAt: "2026-06-23T14:00:00Z",
    assignee: "Priya Sharma",
    timeline: [
      {
        id: "te7",
        type: "created",
        title: "Request created",
        actor: "Ananya Iyer",
        createdAt: "2026-06-23T14:00:00Z",
      },
    ],
  },
];

export const PORTAL_DOCUMENTS: PortalDocument[] = [
  {
    id: "pd1",
    name: "Product Brochure Q2.pdf",
    category: "shared",
    type: "PDF",
    size: "2.4 MB",
    uploadedAt: "2026-06-22T09:30:00Z",
    status: "approved",
  },
  {
    id: "pd2",
    name: "Vendor Agreement Draft.pdf",
    category: "shared",
    type: "PDF",
    size: "1.1 MB",
    uploadedAt: "2026-06-18T10:00:00Z",
    status: "approved",
  },
  {
    id: "pd3",
    name: "Company PAN card",
    category: "requested",
    type: "Upload required",
    size: "—",
    uploadedAt: "2026-06-24T00:00:00Z",
    status: "pending",
    requestedBy: "Priya Sharma",
    dueAt: "2026-06-28T18:00:00Z",
    instructions: "Clear scan or photo. PDF or JPG only.",
  },
  {
    id: "pd4",
    name: "GST registration certificate",
    category: "requested",
    type: "Upload required",
    size: "—",
    uploadedAt: "2026-06-24T00:00:00Z",
    status: "pending",
    requestedBy: "Priya Sharma",
    dueAt: "2026-06-28T18:00:00Z",
    instructions: "Latest certificate from government portal.",
  },
  {
    id: "pd5",
    name: "Signed NDA.pdf",
    category: "signed",
    type: "PDF",
    size: "890 KB",
    uploadedAt: "2026-06-15T14:00:00Z",
    status: "approved",
  },
  {
    id: "pd6",
    name: "Site photo — server room",
    category: "uploaded",
    type: "JPG",
    size: "3.2 MB",
    uploadedAt: "2026-06-21T11:00:00Z",
    status: "received",
  },
];

export const PORTAL_FORMS: PortalFormAssignment[] = [
  {
    id: "pf1",
    name: "Vendor onboarding questionnaire",
    description: "Company details, billing, and technical contacts.",
    status: "pending",
    dueAt: "2026-06-27T18:00:00Z",
    fields: 12,
    progress: 35,
  },
  {
    id: "pf2",
    name: "Security & compliance attestation",
    description: "Required for enterprise trial activation.",
    status: "draft",
    fields: 8,
    progress: 10,
  },
  {
    id: "pf3",
    name: "Demo request form",
    description: "Submitted when you requested product demo.",
    status: "submitted",
    submittedAt: "2026-06-20T08:45:00Z",
    fields: 6,
    progress: 100,
  },
];

export const PORTAL_SIGNATURES: PortalSignature[] = [
  {
    id: "ps1",
    name: "Mutual NDA — TechCorp India",
    status: "pending",
    sentAt: "2026-06-23T08:00:00Z",
    expiresAt: "2026-06-30T18:00:00Z",
    signers: 2,
    signed: 1,
  },
  {
    id: "ps2",
    name: "Data Processing Addendum",
    status: "viewed",
    sentAt: "2026-06-18T10:00:00Z",
    expiresAt: "2026-07-05T18:00:00Z",
    signers: 1,
    signed: 0,
  },
  {
    id: "ps3",
    name: "Pilot agreement — Q2",
    status: "signed",
    sentAt: "2026-06-01T09:00:00Z",
    signedAt: "2026-06-03T15:30:00Z",
    signers: 2,
    signed: 2,
  },
];

export const PORTAL_SURVEYS: PortalSurvey[] = [
  {
    id: "sv1",
    name: "Support experience — CM-1051",
    type: "csat",
    status: "pending",
    dueAt: "2026-06-30T18:00:00Z",
    questions: 3,
  },
  {
    id: "sv2",
    name: "Quarterly relationship NPS",
    type: "nps",
    status: "pending",
    questions: 2,
  },
  {
    id: "sv3",
    name: "Onboarding feedback",
    type: "onboarding",
    status: "completed",
    completedAt: "2026-06-15T10:00:00Z",
    questions: 5,
  },
];

export const PORTAL_ACTIVITY: PortalActivityItem[] = [
  {
    id: "act1",
    type: "case",
    title: "Priya Sharma commented on CM-1051",
    description: "Additional information requested for demo access.",
    createdAt: "2026-06-24T08:30:00Z",
  },
  {
    id: "act2",
    type: "document",
    title: "Product brochure shared",
    description: "Product Brochure Q2.pdf added to your vault.",
    createdAt: "2026-06-22T09:30:00Z",
  },
  {
    id: "act3",
    type: "esign",
    title: "NDA sent for signature",
    description: "Mutual NDA — TechCorp India awaiting your signature.",
    createdAt: "2026-06-23T08:00:00Z",
  },
  {
    id: "act4",
    type: "form",
    title: "Onboarding form started",
    description: "35% complete — vendor onboarding questionnaire.",
    createdAt: "2026-06-22T16:00:00Z",
  },
];

export const PORTAL_NOTIFICATIONS: PortalNotification[] = [
  {
    id: "n1",
    title: "Document upload requested",
    body: "Priya Sharma requested your company PAN card.",
    read: false,
    createdAt: "2026-06-24T09:00:00Z",
    href: "/portal/documents?tab=requested",
  },
  {
    id: "n2",
    title: "Signature required",
    body: "Mutual NDA expires in 6 days.",
    read: false,
    createdAt: "2026-06-23T08:00:00Z",
    href: "/portal/signatures",
  },
  {
    id: "n3",
    title: "Case update",
    body: "CM-1051 — additional details requested.",
    read: true,
    createdAt: "2026-06-24T08:30:00Z",
    href: "/portal/requests/pr1",
  },
];

export const PORTAL_FAQ = [
  {
    q: "How do I upload a requested document?",
    a: "Go to Documents → Requested uploads, select the item, and attach a PDF or image.",
  },
  {
    q: "Who is my account contact?",
    a: "Your assigned representative is shown on the home page and profile.",
  },
  {
    q: "How long until my request is answered?",
    a: "Urgent requests target same-day response. SLA is shown on each request.",
  },
];

export function getPortalRequest(id: string) {
  return PORTAL_REQUESTS.find((r) => r.id === id);
}

export function getPortalStats() {
  const openRequests = PORTAL_REQUESTS.filter(
    (r) => r.status === "open" || r.status === "new" || r.status === "pending"
  ).length;
  const pendingSignatures = PORTAL_SIGNATURES.filter(
    (s) => s.status === "pending" || s.status === "viewed"
  ).length;
  const pendingUploads = PORTAL_DOCUMENTS.filter(
    (d) => d.category === "requested" && d.status === "pending"
  ).length;
  const pendingSurveys = PORTAL_SURVEYS.filter((s) => s.status === "pending").length;

  return {
    actionCount: PORTAL_ACTIONS.length,
    openRequests,
    pendingSignatures,
    pendingUploads,
    pendingSurveys,
    unreadNotifications: PORTAL_NOTIFICATIONS.filter((n) => !n.read).length,
  };
}
