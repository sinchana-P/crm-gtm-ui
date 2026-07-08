import {
  ArrowRightLeft,
  Bot,
  CircleHelp,
  FileText,
  Globe,
  Link2,
  MessageSquareText,
  Sparkles,
  UserPlus,
} from "lucide-react";
import type {
  ChatbotSourceStatus,
  ChatbotSourceType,
  ChatConversationStatus,
  ChatHandoffTrigger,
  ChatIntentAction,
  ChatSentiment,
  Chatbot,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ChatbotStatusBadge({ status }: { status: Chatbot["status"] }) {
  const styles: Record<Chatbot["status"], string> = {
    active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    paused: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    draft: "bg-muted text-muted-foreground",
  };
  return <Badge variant="outline" className={cn("border-0 capitalize", styles[status])}>{status}</Badge>;
}

export const SOURCE_META: Record<ChatbotSourceType, { label: string; icon: typeof FileText }> = {
  document: { label: "Document", icon: FileText },
  url: { label: "Website", icon: Globe },
  faq: { label: "FAQ", icon: CircleHelp },
  text: { label: "Text snippet", icon: MessageSquareText },
};

export const SOURCE_STATUS_STYLES: Record<ChatbotSourceStatus, string> = {
  trained: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  training: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  queued: "bg-muted text-muted-foreground",
  error: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export const INTENT_ACTION_META: Record<ChatIntentAction, { label: string; icon: typeof Bot }> = {
  answer: { label: "Answer from knowledge", icon: Sparkles },
  route_team: { label: "Route to resource", icon: Link2 },
  capture_lead: { label: "Capture lead", icon: UserPlus },
  handoff: { label: "Hand off to human", icon: ArrowRightLeft },
  link: { label: "Share a link", icon: Link2 },
};

export const HANDOFF_TRIGGER_LABELS: Record<ChatHandoffTrigger, string> = {
  user_request: "Visitor asks for a human",
  negative_sentiment: "Negative sentiment detected",
  no_answer: "Bot can't answer",
  high_intent: "High buying intent",
  keyword: "Keyword mentioned",
  off_hours: "Outside business hours",
};

export const CONVO_STATUS_META: Record<ChatConversationStatus, { label: string; className: string }> = {
  bot: { label: "Bot", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  handed_off: { label: "Handed off", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  resolved: { label: "Resolved", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  abandoned: { label: "Abandoned", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400" },
};

export const SENTIMENT_META: Record<ChatSentiment, { label: string; className: string }> = {
  positive: { label: "Positive", className: "text-emerald-600 dark:text-emerald-400" },
  neutral: { label: "Neutral", className: "text-muted-foreground" },
  negative: { label: "Negative", className: "text-red-600 dark:text-red-400" },
};

export function ChatbotAvatar({ initials, color, className }: { initials?: string; color: string; className?: string }) {
  return (
    <span
      className={cn("flex size-8 items-center justify-center rounded-full text-sm font-semibold text-white", className)}
      style={{ backgroundColor: color }}
    >
      {initials || <Bot className="size-4" />}
    </span>
  );
}
