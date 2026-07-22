"use client";

import { PageHeader } from "@/components/shared/page-header";
import { CmCaseList } from "@/components/case-manager/cm-case-list";

export default function CmCasesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Cases" description="All cases across every project in the back office." />
      <CmCaseList baseHref="/case-manager/cases" />
    </div>
  );
}
