import {
  Columns2,
  Heading,
  Image as ImageIcon,
  Code2,
  Minus,
  MousePointerClick,
  Share2,
  Sparkles,
  StretchVertical,
  Type,
} from "lucide-react";
import type { EmailBlockType, EmailTemplate } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { PERSONALIZATION_TOKENS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type IconType = typeof Type;

export const BLOCK_META: Record<
  EmailBlockType,
  { label: string; icon: IconType; hint: string }
> = {
  heading: { label: "Heading", icon: Heading, hint: "A title or section header" },
  text: { label: "Text", icon: Type, hint: "A paragraph of copy" },
  image: { label: "Image", icon: ImageIcon, hint: "A picture or hero banner" },
  button: { label: "Button", icon: MousePointerClick, hint: "A call-to-action button" },
  divider: { label: "Divider", icon: Minus, hint: "A horizontal rule" },
  spacer: { label: "Spacer", icon: StretchVertical, hint: "Vertical spacing" },
  social: { label: "Social", icon: Share2, hint: "Social media icons" },
  columns: { label: "Columns", icon: Columns2, hint: "A multi-column layout" },
  html: { label: "Custom HTML", icon: Code2, hint: "Raw HTML snippet" },
  dynamic: { label: "Dynamic content", icon: Sparkles, hint: "Content that varies by contact" },
};

export const EMAIL_STATUS_STYLES: Record<NonNullable<EmailTemplate["status"]>, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  archived: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

export function EmailStatusBadge({ status }: { status?: EmailTemplate["status"] }) {
  const s = status ?? "draft";
  return (
    <Badge variant="outline" className={cn("border-0 capitalize", EMAIL_STATUS_STYLES[s])}>
      {s}
    </Badge>
  );
}

export function EmailTypeBadge({ type }: { type?: EmailTemplate["type"] }) {
  if (!type) return null;
  return (
    <Badge variant="outline" className="capitalize">
      {type}
    </Badge>
  );
}

/** Replace personalization tokens with sample values for preview rendering. */
export function personalize(text: string): string {
  let out = text;
  for (const t of PERSONALIZATION_TOKENS) {
    if (t.token === "{{unsubscribeLink}}") continue;
    out = out.split(t.token).join(t.sample);
  }
  return out;
}

/** True if a string contains any personalization token. */
export function hasTokens(text: string): boolean {
  return PERSONALIZATION_TOKENS.some((t) => text.includes(t.token));
}

export function rate(value: number, base: number) {
  return base > 0 ? ((value / base) * 100).toFixed(1) : "0.0";
}

export { PERSONALIZATION_TOKENS };
