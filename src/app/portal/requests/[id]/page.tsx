import { PortalRequestDetail } from "@/components/portal/portal-request-detail";

export default async function PortalRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PortalRequestDetail id={id} />;
}
