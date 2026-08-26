import { AutomationsBuilder } from "@/components/marketing/automations/automations-builder";
import { SAMPLE_WORKFLOWS, type Workflow } from "@/lib/mock-data/automations";

const BLANK: Workflow = {
  id: "new",
  name: "Untitled workflow",
  object: "lead",
  triggerType: "lead.created",
  enabled: false,
  runs: 0,
  updated: "just now",
  steps: [],
};

export default async function AutomationBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wf = SAMPLE_WORKFLOWS.find((w) => w.id === id) ?? BLANK;
  return <AutomationsBuilder initial={wf} />;
}
