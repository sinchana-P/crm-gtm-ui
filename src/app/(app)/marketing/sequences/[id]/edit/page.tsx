import { SequenceBuilder } from "@/components/marketing/sequences/sequence-builder";

export default async function EditSequencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SequenceBuilder sequenceId={id} />;
}
