import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RecordProfileLayoutProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  className?: string;
}

export function RecordProfileLayout({
  left,
  center,
  right,
  className,
}: RecordProfileLayoutProps) {
  return (
    <div
      className={cn(
        "grid min-h-[calc(100dvh-3.5rem)] gap-0 bg-muted/30 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(240px,300px)]",
        className
      )}
    >
      <aside className="min-h-0 border-b border-border bg-background lg:border-b-0 lg:border-r">
        <div className="h-full overflow-y-auto p-4 lg:max-h-[calc(100dvh-3.5rem)]">
          {left}
        </div>
      </aside>
      <main className="min-h-0 border-b border-border lg:border-b-0">
        <div className="h-full overflow-y-auto p-4 lg:max-h-[calc(100dvh-3.5rem)]">
          {center}
        </div>
      </main>
      <aside className="min-h-0 bg-background">
        <div className="h-full overflow-y-auto p-4 lg:max-h-[calc(100dvh-3.5rem)]">
          {right}
        </div>
      </aside>
    </div>
  );
}
