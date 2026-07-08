import { AutomationBuilder } from "@/components/marketing/automations/automation-builder";

export default async function NewAutomationPage({
  searchParams,
}: {
  searchParams: Promise<{ recipe?: string }>;
}) {
  const { recipe } = await searchParams;
  return <AutomationBuilder recipeId={recipe} />;
}
