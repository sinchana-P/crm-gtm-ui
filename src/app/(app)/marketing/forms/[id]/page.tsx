import { FormDetail } from "@/components/marketing/analytics/form-detail";

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FormDetail id={id} />;
}
