import { PortalLayoutClient } from "@/components/portal/portal-layout-client";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>;
}
