import { PageHeader } from "@/components/shared/page-header";
import { CopilotWorkspace } from "@/components/marketing/copilot/copilot-workspace";

export default function MarketingCopilotPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing Copilot"
        description="Your AI assistant for marketing. Create campaigns, automation workflows and audience segments from a plain-language description, and ask questions about how they're performing."
      />
      <CopilotWorkspace />
    </div>
  );
}
