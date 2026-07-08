import { EmailEditor } from "@/components/marketing/email/email-editor";

export default async function NewTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ starter?: string }>;
}) {
  const { starter } = await searchParams;
  return <EmailEditor starterId={starter} />;
}
