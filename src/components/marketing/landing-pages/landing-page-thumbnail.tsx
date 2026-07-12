import type { LandingPage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LandingBlockRender } from "@/components/marketing/landing-pages/landing-block-render";
import { PADDING_Y_CLASS } from "@/components/marketing/landing-pages/landing-shared";

function bgStyle(section: LandingPage["sections"][number]): React.CSSProperties | undefined {
  const b = section.background;
  if (b.type === "color") return { backgroundColor: b.color };
  if (b.type === "gradient") return { backgroundImage: `linear-gradient(135deg, ${b.gradientFrom ?? "#fff"}, ${b.gradientTo ?? "#fff"})` };
  if (b.type === "image" && b.imageUrl) return { backgroundImage: `url(${b.imageUrl})`, backgroundSize: "cover" };
  return undefined;
}

/**
 * Miniature, non-interactive render of a page's sections. Used for card
 * thumbnails and the builder's live preview surface.
 */
export function LandingPageThumbnail({
  page,
  device = "desktop",
  className,
}: {
  page: Pick<LandingPage, "sections" | "theme">;
  device?: "desktop" | "tablet" | "mobile";
  className?: string;
}) {
  const widthClass = device === "mobile" ? "max-w-[380px]" : device === "tablet" ? "max-w-[720px]" : "max-w-[960px]";
  return (
    <div className={cn("mx-auto w-full bg-white", widthClass, className)}>
      {page.sections.length === 0 ? (
        <p className="py-16 text-center text-sm text-neutral-400">Empty page</p>
      ) : (
        page.sections.map((s) => (
          <div key={s.id} style={bgStyle(s)} className={cn(PADDING_Y_CLASS[s.paddingY ?? "lg"])}>
            <div className={cn("mx-auto grid gap-6 px-6", s.width === "full" ? "max-w-none" : "max-w-4xl", s.columns === 2 ? "sm:grid-cols-2" : s.columns === 3 ? "sm:grid-cols-3" : "grid-cols-1")}>
              {s.content.map((col, ci) => (
                <div key={ci} className="space-y-4">
                  {col.map((b) => (
                    <LandingBlockRender key={b.id} block={b} theme={page.theme} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
