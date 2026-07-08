import { EmailEditor } from "@/components/marketing/email/email-editor";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmailEditor templateId={id} />;
}
