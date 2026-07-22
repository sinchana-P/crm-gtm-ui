"use client";

import { PageHeader } from "@/components/shared/page-header";
import { CmCaseList } from "@/components/case-manager/cm-case-list";
import { CURRENT_REP } from "@/lib/stores/view-level-store";

export default function CmMyCasesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Cases"
        description="Cases assigned to you or where you're a watcher."
      />
      <CmCaseList
        baseHref="/case-manager/cases"
        emptyLabel="No cases assigned to you"
        filter={(c) => c.assignee === CURRENT_REP.name || c.watchers.includes(CURRENT_REP.name)}
      />
    </div>
  );
}
