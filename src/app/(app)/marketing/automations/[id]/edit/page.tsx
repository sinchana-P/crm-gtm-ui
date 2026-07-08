import { AutomationBuilder } from "@/components/marketing/automations/automation-builder";

export default async function EditAutomationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AutomationBuilder automationId={id} />;
}
