import {
  AlignLeft,
  Clock,
  Code2,
  FileInput,
  Heading,
  Image as ImageIcon,
  LayoutList,
  ListChecks,
  Menu,
  Minus,
  MousePointerClick,
  PanelBottom,
  Quote,
  Share2,
  StretchVertical,
  Table2,
  Type,
  Video,
} from "lucide-react";
import type {
  LandingBlock,
  LandingBlockType,
  LandingPage,
  LandingPageStatus,
  LandingSection,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type IconType = typeof Type;

/** Palette metadata for every block type, grouped for the builder rail. */
export const LANDING_BLOCK_META: Record<
  LandingBlockType,
  { label: string; icon: IconType; hint: string; group: "content" | "media" | "conversion" | "layout" | "advanced" }
> = {
  heading: { label: "Heading", icon: Heading, hint: "A title or section header", group: "content" },
  text: { label: "Text", icon: Type, hint: "A paragraph of body copy", group: "content" },
  list: { label: "Feature list", icon: ListChecks, hint: "Checklist of benefits", group: "content" },
  image: { label: "Image", icon: ImageIcon, hint: "A picture or illustration", group: "media" },
  video: { label: "Video", icon: Video, hint: "Embedded video player", group: "media" },
  logos: { label: "Logo strip", icon: LayoutList, hint: "Customer / partner logos", group: "media" },
  button: { label: "Button", icon: MousePointerClick, hint: "A call-to-action button", group: "conversion" },
  form: { label: "Form", icon: FileInput, hint: "Lead-capture form", group: "conversion" },
  countdown: { label: "Countdown", icon: Clock, hint: "Urgency timer", group: "conversion" },
  pricing: { label: "Pricing table", icon: Table2, hint: "Plan comparison", group: "conversion" },
  testimonial: { label: "Testimonial", icon: Quote, hint: "Social proof quotes", group: "content" },
  stats: { label: "Stats", icon: AlignLeft, hint: "Highlighted metrics", group: "content" },
  faq: { label: "FAQ", icon: ListChecks, hint: "Accordion of questions", group: "content" },
  socialIcons: { label: "Social icons", icon: Share2, hint: "Links to social profiles", group: "media" },
  navbar: { label: "Navbar", icon: Menu, hint: "Top navigation bar", group: "layout" },
  footer: { label: "Footer", icon: PanelBottom, hint: "Page footer", group: "layout" },
  divider: { label: "Divider", icon: Minus, hint: "A horizontal rule", group: "layout" },
  spacer: { label: "Spacer", icon: StretchVertical, hint: "Vertical spacing", group: "layout" },
  html: { label: "Custom HTML", icon: Code2, hint: "Raw HTML / embed", group: "advanced" },
};

export const LANDING_STATUS_STYLES: Record<LandingPageStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  scheduled: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  unpublished: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  archived: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

export function LandingStatusBadge({ status }: { status: LandingPageStatus }) {
  return (
    <Badge variant="outline" className={cn("border-0 capitalize", LANDING_STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

export const LANDING_TYPE_LABELS: Record<LandingPage["type"], string> = {
  "lead-gen": "Lead gen",
  event: "Event",
  webinar: "Webinar",
  ebook: "eBook / gated",
  product: "Product",
  "coming-soon": "Coming soon",
  "thank-you": "Thank you",
};

export function LandingTypeBadge({ type }: { type: LandingPage["type"] }) {
  return (
    <Badge variant="outline" className="capitalize">
      {LANDING_TYPE_LABELS[type]}
    </Badge>
  );
}

let blockSeq = 0;
export function createLandingId(prefix = "lp") {
  return `${prefix}-${Date.now()}-${(blockSeq += 1)}`;
}

export const PADDING_Y_CLASS: Record<NonNullable<LandingSection["paddingY"]>, string> = {
  none: "py-0",
  sm: "py-4",
  md: "py-8",
  lg: "py-14",
  xl: "py-24",
};

/** Builds a sensible default block for a freshly-dropped element. */
export function makeLandingBlock(type: LandingBlockType): LandingBlock {
  const id = createLandingId("blk");
  switch (type) {
    case "heading":
      return { id, type, text: "Your compelling headline", level: 1, align: "center" };
    case "text":
      return { id, type, text: "Add a short paragraph that explains the value you deliver.", align: "center" };
    case "list":
      return { id, type, items: ["Benefit one", "Benefit two", "Benefit three"] };
    case "image":
      return { id, type, src: "", alt: "", align: "center" };
    case "video":
      return { id, type, videoUrl: "", posterUrl: "", align: "center" };
    case "logos":
      return { id, type, logos: ["Acme", "Globex", "Umbrella", "Initech", "Hooli"] };
    case "button":
      return { id, type, text: "Get started", url: "#", align: "center", buttonStyle: "primary", buttonSize: "lg" };
    case "form":
      return {
        id,
        type,
        form: {
          submitLabel: "Get instant access",
          layout: "stacked",
          recaptcha: true,
          action: "message",
          thankYouMessage: "Thanks! We'll be in touch shortly.",
          consentRequired: true,
          fields: [
            { id: createLandingId("fld"), type: "text", label: "Full name", mapTo: "name", required: true, width: "full" },
            { id: createLandingId("fld"), type: "email", label: "Work email", mapTo: "email", required: true, width: "full" },
            { id: createLandingId("fld"), type: "consent", label: "I agree to receive marketing communications.", required: true, width: "full" },
          ],
        },
      };
    case "countdown":
      return { id, type, countdownTo: "", align: "center" };
    case "pricing":
      return {
        id,
        type,
        pricing: [
          { id: createLandingId("tier"), name: "Starter", price: "$0", period: "/mo", features: ["1 seat", "Basic reports"], ctaLabel: "Start free" },
          { id: createLandingId("tier"), name: "Growth", price: "$49", period: "/mo", features: ["5 seats", "Automations", "Priority support"], ctaLabel: "Choose Growth", highlighted: true },
          { id: createLandingId("tier"), name: "Scale", price: "$149", period: "/mo", features: ["Unlimited seats", "SSO", "Dedicated CSM"], ctaLabel: "Contact sales" },
        ],
      };
    case "testimonial":
      return {
        id,
        type,
        testimonials: [
          { id: createLandingId("tst"), quote: "This completely changed how our team works.", author: "Jordan Lee", role: "VP Marketing, Northwind" },
        ],
      };
    case "stats":
      return {
        id,
        type,
        stats: [
          { id: createLandingId("st"), value: "12k+", label: "Customers" },
          { id: createLandingId("st"), value: "99.9%", label: "Uptime" },
          { id: createLandingId("st"), value: "4.9/5", label: "Avg rating" },
        ],
      };
    case "faq":
      return {
        id,
        type,
        faqs: [
          { id: createLandingId("faq"), question: "How does the free trial work?", answer: "You get full access for 14 days, no card required." },
          { id: createLandingId("faq"), question: "Can I cancel anytime?", answer: "Yes — cancel in one click from your account settings." },
        ],
      };
    case "socialIcons":
      return { id, type, socials: ["twitter", "linkedin", "instagram"], align: "center" };
    case "navbar":
      return {
        id,
        type,
        text: "Connect",
        navLinks: [
          { id: createLandingId("nav"), label: "Features", url: "#features" },
          { id: createLandingId("nav"), label: "Pricing", url: "#pricing" },
        ],
      };
    case "footer":
      return { id, type, text: "© Connect NX. All rights reserved.", socials: ["twitter", "linkedin"] };
    case "divider":
      return { id, type };
    case "spacer":
      return { id, type, height: 32 };
    case "html":
      return { id, type, html: "" };
    default:
      return { id, type };
  }
}

/** Empty single-column section with a light background. */
export function makeLandingSection(columns: 1 | 2 | 3 = 1): LandingSection {
  return {
    id: createLandingId("sec"),
    columns,
    content: Array.from({ length: columns }, () => []),
    background: { type: "none" },
    paddingY: "lg",
    width: "boxed",
    verticalAlign: "top",
  };
}

/** Count blocks + submissions across a page for summary chips. */
export function countBlocks(page: LandingPage): number {
  return page.sections.reduce((n, s) => n + s.content.reduce((m, col) => m + col.length, 0), 0);
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
