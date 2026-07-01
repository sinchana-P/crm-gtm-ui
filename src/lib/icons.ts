import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP = LucideIcons as unknown as Record<string, LucideIcon | undefined>;

export function getNavIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? LucideIcons.Circle;
}
