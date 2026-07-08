import { EmailTemplateDetail } from "@/components/marketing/email/email-template-detail";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmailTemplateDetail id={id} />;
}
