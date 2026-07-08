import { SequenceDetail } from "@/components/marketing/sequences/sequence-detail";

export default async function SequenceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SequenceDetail id={id} />;
}
