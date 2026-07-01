import type { PortalNavItem } from "@/lib/types/portal";
import { getPortalStats } from "@/lib/mock-data/portal";

export const PORTAL_NAV: PortalNavItem[] = [
  { id: "home", label: "Home", href: "/portal", icon: "LayoutDashboard" },
  { id: "requests", label: "Requests", href: "/portal/requests", icon: "LifeBuoy" },
  { id: "documents", label: "Documents", href: "/portal/documents", icon: "FolderOpen" },
  { id: "forms", label: "Forms", href: "/portal/forms", icon: "FileInput" },
  { id: "signatures", label: "Signatures", href: "/portal/signatures", icon: "PenLine" },
  { id: "surveys", label: "Surveys", href: "/portal/surveys", icon: "ClipboardList" },
  { id: "messages", label: "Messages", href: "/portal/messages", icon: "MessageCircle" },
  { id: "profile", label: "Profile", href: "/portal/profile", icon: "User" },
  { id: "help", label: "Help", href: "/portal/help", icon: "CircleHelp" },
];

export function getPortalNavWithBadges(): PortalNavItem[] {
  const stats = getPortalStats();
  return PORTAL_NAV.map((item) => {
    if (item.id === "home") return { ...item, badge: stats.actionCount };
    if (item.id === "requests") return { ...item, badge: stats.openRequests };
    if (item.id === "documents") return { ...item, badge: stats.pendingUploads };
    if (item.id === "signatures") return { ...item, badge: stats.pendingSignatures };
    if (item.id === "surveys") return { ...item, badge: stats.pendingSurveys };
    if (item.id === "messages") return { ...item, badge: stats.unreadMessages };
    return item;
  });
}
