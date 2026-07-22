import { CmShell } from "@/components/case-manager/cm-shell";

export default function CaseManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CmShell>{children}</CmShell>;
}
