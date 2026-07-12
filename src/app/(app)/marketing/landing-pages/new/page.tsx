import { LandingPageBuilder } from "@/components/marketing/landing-pages/landing-page-builder";

export default async function NewLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  return <LandingPageBuilder templateId={template} />;
}
