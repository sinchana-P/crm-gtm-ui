import { AutomationDetail } from "@/components/marketing/automations/automation-detail";

export default async function AutomationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AutomationDetail id={id} />;
}
