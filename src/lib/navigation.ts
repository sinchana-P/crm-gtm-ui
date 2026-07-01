import type { NavItem, PluginId } from "@/lib/types";
import type { ViewLevel } from "@/lib/stores/view-level-store";
import { ADMIN_ONLY_NAV_IDS, isAdminView, navLabelForItem } from "@/lib/view-scope";

export const NAV_ITEMS: NavItem[] = [
  // Core — Contact Management
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", section: "core" },
  { id: "work-queue", label: "Work Queue", href: "/work-queue", icon: "ListChecks", section: "core" },
  { id: "leads", label: "Leads", href: "/leads", icon: "UserPlus", section: "core" },
  { id: "contacts", label: "Contacts", href: "/contacts", icon: "Users", section: "core" },
  { id: "customers", label: "Customers", href: "/customers", icon: "Building2", section: "core" },
  {
    id: "data",
    label: "Data",
    icon: "Database",
    section: "core",
    children: [
      { id: "lists", label: "Lists & Tags", href: "/lists", icon: "Tags", section: "core" },
      { id: "duplicates", label: "Duplicates", href: "/duplicates", icon: "Copy", section: "core" },
      { id: "import", label: "Import", href: "/import", icon: "Upload", section: "core" },
      { id: "documents", label: "Documents", href: "/documents", icon: "FolderOpen", section: "core" },
      { id: "surveys", label: "Surveys", href: "/surveys", icon: "ClipboardList", section: "core" },
    ],
  },
  { id: "reports", label: "Reports", href: "/reports", icon: "BarChart3", section: "core" },

  // Marketing plugin
  { id: "mkt-dashboard", label: "Marketing Home", href: "/marketing", icon: "Megaphone", section: "marketing", plugin: "marketing" },
  {
    id: "mkt-outreach",
    label: "Outreach",
    icon: "Send",
    section: "marketing",
    plugin: "marketing",
    children: [
      { id: "campaigns", label: "Campaigns", href: "/marketing/campaigns", icon: "Mail", section: "marketing", plugin: "marketing" },
      { id: "sequences", label: "Sequences", href: "/marketing/sequences", icon: "GitBranch", section: "marketing", plugin: "marketing" },
      { id: "automations", label: "Automations", href: "/marketing/automations", icon: "Workflow", section: "marketing", plugin: "marketing" },
    ],
  },
  {
    id: "mkt-audience",
    label: "Audience",
    icon: "Filter",
    section: "marketing",
    plugin: "marketing",
    children: [
      { id: "segments", label: "Segments", href: "/marketing/segments", icon: "Filter", section: "marketing", plugin: "marketing" },
      { id: "forms", label: "Forms", href: "/marketing/forms", icon: "FileInput", section: "marketing", plugin: "marketing" },
    ],
  },
  {
    id: "mkt-content",
    label: "Content",
    icon: "LayoutTemplate",
    section: "marketing",
    plugin: "marketing",
    children: [
      { id: "templates", label: "Templates", href: "/marketing/templates", icon: "LayoutTemplate", section: "marketing", plugin: "marketing" },
      { id: "inbox", label: "Inbox", href: "/marketing/inbox", icon: "Inbox", section: "marketing", plugin: "marketing" },
      { id: "calendar", label: "Campaign Calendar", href: "/marketing/calendar", icon: "Calendar", section: "marketing", plugin: "marketing" },
    ],
  },
  { id: "deliverability", label: "Deliverability", href: "/marketing/deliverability", icon: "ShieldCheck", section: "marketing", plugin: "marketing" },

  // Cases plugin
  { id: "cases", label: "Cases", href: "/cases", icon: "LifeBuoy", section: "cases", plugin: "cases" },
  { id: "case-queue", label: "Open Cases Queue", href: "/cases/queue", icon: "AlarmClock", section: "cases", plugin: "cases" },
  { id: "case-templates", label: "Case Templates", href: "/cases/templates", icon: "FileStack", section: "cases", plugin: "cases" },

  // E-sign plugin
  { id: "esign", label: "E-sign", href: "/esign", icon: "PenLine", section: "esign", plugin: "esign" },
  { id: "esign-templates", label: "Sign Templates", href: "/esign/templates", icon: "FileSignature", section: "esign", plugin: "esign" },
  { id: "esign-bulk", label: "Bulk Send", href: "/esign/bulk", icon: "Send", section: "esign", plugin: "esign" },

  // Settings
  { id: "settings", label: "Settings", href: "/settings", icon: "Settings", section: "settings" },
  {
    id: "settings-config",
    label: "Configuration",
    icon: "SlidersHorizontal",
    section: "settings",
    children: [
      { id: "settings-assignment", label: "Assignment Rules", href: "/settings/assignment", icon: "Route", section: "settings" },
      { id: "settings-scoring", label: "Lead Scoring", href: "/settings/scoring", icon: "Target", section: "settings" },
      { id: "settings-fields", label: "Custom Fields", href: "/settings/fields", icon: "Columns3", section: "settings" },
      { id: "settings-consent", label: "Consent & Privacy", href: "/settings/consent", icon: "Lock", section: "settings" },
    ],
  },
  {
    id: "settings-connections",
    label: "Integrations & Plugins",
    icon: "Plug",
    section: "settings",
    children: [
      { id: "settings-plugins", label: "Plugins", href: "/settings/plugins", icon: "Puzzle", section: "settings" },
      { id: "settings-integrations", label: "Integrations", href: "/settings/integrations", icon: "Plug", section: "settings" },
    ],
  },
];

const SECTION_LABELS: Record<string, string> = {
  core: "Contacts",
  marketing: "Marketing",
  cases: "Cases",
  esign: "E-sign",
  settings: "Settings",
};

/**
 * Filters a single nav item (and its children) for the current plugin/view
 * scope, relabels it, and drops parent items whose children are all hidden.
 * Returns null when the item should not be shown.
 */
function scopeNavItem(
  item: NavItem,
  isPluginEnabled: (id: PluginId) => boolean,
  viewLevel: ViewLevel
): NavItem | null {
  if (item.plugin && !isPluginEnabled(item.plugin)) return null;
  if (!isAdminView(viewLevel) && ADMIN_ONLY_NAV_IDS.has(item.id)) return null;

  const label = navLabelForItem(item.id, item.label, viewLevel);

  if (item.children?.length) {
    const children = item.children
      .map((child) => scopeNavItem(child, isPluginEnabled, viewLevel))
      .filter((child): child is NavItem => child !== null);
    // A parent with no visible children has nothing to expand — hide it.
    if (children.length === 0) return null;
    return { ...item, label, children };
  }

  return { ...item, label };
}

export function getVisibleNav(
  isPluginEnabled: (id: PluginId) => boolean,
  viewLevel: ViewLevel = "admin"
): { section: string; label: string; items: NavItem[] }[] {
  const sections = ["core", "marketing", "cases", "esign", "settings"];
  return sections
    .map((section) => ({
      section,
      label: SECTION_LABELS[section],
      items: NAV_ITEMS.filter((i) => i.section === section)
        .map((item) => scopeNavItem(item, isPluginEnabled, viewLevel))
        .filter((item): item is NavItem => item !== null),
    }))
    .filter((g) => g.items.length > 0);
}
