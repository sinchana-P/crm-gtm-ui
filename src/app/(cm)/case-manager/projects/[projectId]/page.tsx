import { ProjectWorkspace } from "@/components/case-manager/project-workspace";

export default async function ProjectWorkspaceRoute({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectWorkspace projectId={projectId} />;
}
