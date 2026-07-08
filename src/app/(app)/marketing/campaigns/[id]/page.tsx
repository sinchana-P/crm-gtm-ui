import { CampaignDetail } from "@/components/marketing/campaigns/campaign-detail";

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  return <CampaignDetail id={id} initialTab={tab} />;
}
