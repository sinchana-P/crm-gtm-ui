import { LandingPageBuilder } from "@/components/marketing/landing-pages/landing-page-builder";

export default async function EditLandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LandingPageBuilder pageId={id} />;
}
