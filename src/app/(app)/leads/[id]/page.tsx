import { ContactRecordPage } from "@/components/contacts/contact-record-view";

export default async function LeadRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContactRecordPage id={id} entityType="lead" />;
}
