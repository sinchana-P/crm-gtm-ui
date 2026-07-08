import { Image as ImageIcon } from "lucide-react";
import type { EmailBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { personalize } from "@/components/marketing/email/email-shared";

const SOCIAL_LETTERS: Record<string, string> = {
  twitter: "X",
  linkedin: "in",
  instagram: "IG",
  facebook: "f",
  youtube: "YT",
};

function alignClass(align?: EmailBlock["align"]) {
  return align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
}

/** Renders a token-aware string; the unsubscribe token becomes a muted link. */
function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split("{{unsubscribeLink}}");
  return (
    <span className={className}>
      {parts.map((p, i) => (
        <span key={i}>
          {personalize(p)}
          {i < parts.length - 1 && (
            <a className="underline" href="#unsub">
              Unsubscribe
            </a>
          )}
        </span>
      ))}
    </span>
  );
}

export function EmailBlockRender({ block }: { block: EmailBlock }) {
  switch (block.type) {
    case "heading": {
      const size = block.level === 1 ? "text-2xl" : block.level === 2 ? "text-xl" : "text-lg";
      return (
        <h2
          className={cn("font-semibold text-neutral-900", size, alignClass(block.align))}
          style={block.textColor ? { color: block.textColor } : undefined}
        >
          {personalize(block.text ?? "Heading")}
        </h2>
      );
    }
    case "text":
      return (
        <p className={cn("text-sm leading-relaxed text-neutral-700", alignClass(block.align))}>
          <RichText text={block.text ?? ""} />
        </p>
      );
    case "image":
      return (
        <div className={alignClass(block.align)}>
          {block.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.src} alt={block.alt ?? ""} className="inline-block max-w-full rounded" />
          ) : (
            <div className="flex aspect-[16/7] w-full items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-100 text-neutral-400">
              <div className="flex flex-col items-center gap-1 text-xs">
                <ImageIcon className="size-6" />
                {block.alt || "Image placeholder"}
              </div>
            </div>
          )}
        </div>
      );
    case "button":
      return (
        <div className={alignClass(block.align)}>
          <span
            className="inline-block rounded-md px-5 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: block.buttonColor || "#2563eb" }}
          >
            {personalize(block.text ?? "Button")}
          </span>
        </div>
      );
    case "divider":
      return <hr className="border-neutral-200" />;
    case "spacer":
      return <div style={{ height: block.height ?? 24 }} />;
    case "social":
      return (
        <div className={cn("flex gap-3", block.align === "center" ? "justify-center" : block.align === "right" ? "justify-end" : "justify-start")}>
          {(block.socials ?? ["twitter", "linkedin"]).map((s) => (
            <span key={s} className="flex size-8 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              {SOCIAL_LETTERS[s] ?? s.charAt(0).toUpperCase()}
            </span>
          ))}
        </div>
      );
    case "columns": {
      const cols = block.colText ?? ["Column one", "Column two"];
      return (
        <div className={cn("grid gap-4", cols.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
          {cols.map((c, i) => (
            <div key={i} className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
              <RichText text={c} />
            </div>
          ))}
        </div>
      );
    }
    case "html":
      return (
        <div className="rounded border border-dashed border-neutral-300 bg-neutral-50 p-3 font-mono text-xs text-neutral-500">
          {block.html?.trim() ? block.html : "<!-- custom HTML block -->"}
        </div>
      );
    case "dynamic": {
      const variants = block.dynamicVariants ?? [];
      const def = variants[0];
      return (
        <div className="rounded-lg border border-dashed border-violet-300 bg-violet-50/60 p-3">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-violet-600">
            Dynamic content
          </p>
          <p className="text-sm text-neutral-700">
            <RichText text={def?.text ?? "Default content"} />
          </p>
          {variants.length > 1 && (
            <p className="mt-1.5 text-xs text-violet-600">
              +{variants.length - 1} variant{variants.length > 2 ? "s" : ""} by contact rules
            </p>
          )}
        </div>
      );
    }
    default:
      return null;
  }
}
