import { LandingPageDetail } from "@/components/marketing/landing-pages/landing-page-detail";

export default async function LandingPageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LandingPageDetail pageId={id} />;
}
