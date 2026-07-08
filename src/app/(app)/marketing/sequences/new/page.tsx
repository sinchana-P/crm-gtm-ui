import { SequenceBuilder } from "@/components/marketing/sequences/sequence-builder";

export default async function NewSequencePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  return <SequenceBuilder templateId={template} />;
}
