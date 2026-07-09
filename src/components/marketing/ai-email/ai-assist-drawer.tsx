"use client";

import { Sparkles } from "lucide-react";
import type { AiDraftSection } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AiComposer } from "@/components/marketing/ai-email/ai-composer";

export function AiAssistDrawer({
  open,
  onOpenChange,
  onApply,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onApply: (subject: string, sections: AiDraftSection[]) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" /> AI Assist
          </SheetTitle>
          <SheetDescription>Describe the email and apply the draft straight into your editor.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 px-4 pb-8">
          <AiComposer
            compact
            onApply={(subject, _body, sections) => {
              onApply(subject, sections);
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
