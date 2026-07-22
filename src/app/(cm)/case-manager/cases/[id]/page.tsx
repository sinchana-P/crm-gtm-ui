import { CaseDetail } from "@/components/case-manager/case-detail";

export default async function CmCaseDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseDetail caseId={id} backHref="/case-manager/cases" />;
}
