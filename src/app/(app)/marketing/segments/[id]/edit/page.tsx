import { SegmentBuilder } from "@/components/marketing/segments/segment-builder";

export default async function EditSegmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SegmentBuilder segmentId={id} />;
}
