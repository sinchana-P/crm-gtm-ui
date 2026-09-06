import { PageHeader } from "@/components/shared/page-header";
import { ConsentInsights } from "@/components/marketing/consent-insights";

export default function ConsentInsightsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Consent insights"
        description="Who has consented to what, across your audience — reach per channel and the gap to work on."
      />
      <ConsentInsights />
    </div>
  );
}
