import { Check, Image as ImageIcon, Play, Star } from "lucide-react";
import type { LandingBlock, LandingTheme } from "@/lib/types";
import { cn } from "@/lib/utils";

const SOCIAL_LETTERS: Record<string, string> = {
  twitter: "X",
  linkedin: "in",
  instagram: "IG",
  facebook: "f",
  youtube: "YT",
  github: "gh",
};

function alignClass(align?: LandingBlock["align"]) {
  return align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
}

function radiusClass(radius?: LandingTheme["buttonRadius"]) {
  return radius === "none" ? "rounded-none" : radius === "sm" ? "rounded" : radius === "full" ? "rounded-full" : "rounded-lg";
}

/**
 * Renders a single landing-page block. `theme` drives button colors and
 * radius so the preview matches the page's global styles.
 */
export function LandingBlockRender({ block, theme }: { block: LandingBlock; theme: LandingTheme }) {
  const primary = theme.primaryColor;

  switch (block.type) {
    case "heading": {
      const size =
        block.level === 1 ? "text-3xl sm:text-4xl" : block.level === 2 ? "text-2xl sm:text-3xl" : block.level === 3 ? "text-xl" : "text-lg";
      return (
        <p
          className={cn("font-bold tracking-tight text-neutral-900", size, alignClass(block.align))}
          style={block.textColor ? { color: block.textColor } : undefined}
        >
          {block.text || "Your headline"}
        </p>
      );
    }
    case "text":
      return (
        <p
          className={cn("text-[15px] leading-relaxed text-neutral-600", alignClass(block.align))}
          style={block.textColor ? { color: block.textColor } : undefined}
        >
          {block.text || "Body copy"}
        </p>
      );
    case "list":
      return (
        <ul className="mx-auto max-w-md space-y-2">
          {(block.items ?? []).map((it, i) => (
            <li key={i} className="flex items-start gap-2 text-[15px] text-neutral-700">
              <Check className="mt-0.5 size-4 shrink-0" style={{ color: primary }} />
              {it}
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <div className={alignClass(block.align)}>
          {block.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.src} alt={block.alt ?? ""} className="inline-block max-w-full rounded-xl" />
          ) : (
            <div className="flex aspect-[16/8] w-full items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-100 text-neutral-400">
              <div className="flex flex-col items-center gap-1 text-xs">
                <ImageIcon className="size-6" />
                {block.alt || "Image placeholder"}
              </div>
            </div>
          )}
        </div>
      );
    case "video":
      return (
        <div className={alignClass(block.align)}>
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-900">
            {block.posterUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={block.posterUrl} alt="" className="absolute inset-0 size-full object-cover opacity-70" />
            )}
            <span className="relative flex size-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <Play className="size-6 translate-x-0.5 fill-neutral-900 text-neutral-900" />
            </span>
          </div>
        </div>
      );
    case "logos":
      return (
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70">
          {(block.logos ?? []).map((l, i) => (
            <span key={i} className="text-lg font-semibold tracking-tight text-neutral-500">
              {l}
            </span>
          ))}
        </div>
      );
    case "button": {
      const size = block.buttonSize === "sm" ? "px-4 py-2 text-sm" : block.buttonSize === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm";
      const style = block.buttonStyle ?? "primary";
      return (
        <div className={alignClass(block.align)}>
          <span
            className={cn("inline-block font-semibold transition-colors", size, radiusClass(theme.buttonRadius))}
            style={
              style === "primary"
                ? { backgroundColor: primary, color: "#fff" }
                : style === "outline"
                  ? { border: `1.5px solid ${primary}`, color: primary }
                  : { backgroundColor: "#1f2937", color: "#fff" }
            }
          >
            {block.text || "Button"}
          </span>
        </div>
      );
    }
    case "form": {
      const form = block.form;
      if (!form) return null;
      return (
        <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className={cn("grid gap-3", form.layout === "inline" && "sm:grid-cols-2")}>
            {form.fields.map((f) =>
              f.type === "hidden" ? null : f.type === "consent" || f.type === "checkbox" ? (
                <label key={f.id} className="col-span-full flex items-start gap-2 text-xs text-neutral-500">
                  <span className="mt-0.5 size-3.5 shrink-0 rounded border border-neutral-300" />
                  {f.label}
                </label>
              ) : (
                <div key={f.id} className={cn("space-y-1", f.width === "half" ? "sm:col-span-1" : "col-span-full")}>
                  <label className="text-xs font-medium text-neutral-600">
                    {f.label}
                    {f.required && <span className="text-rose-500"> *</span>}
                  </label>
                  {f.type === "textarea" ? (
                    <div className="h-16 rounded-lg border border-neutral-200 bg-neutral-50" />
                  ) : f.type === "select" ? (
                    <div className="flex h-9 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-xs text-neutral-400">
                      {f.placeholder || "Select…"}
                    </div>
                  ) : (
                    <div className="flex h-9 items-center rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-xs text-neutral-400">
                      {f.placeholder || f.label}
                    </div>
                  )}
                </div>
              )
            )}
            <span
              className={cn("col-span-full inline-flex items-center justify-center py-2.5 text-sm font-semibold text-white", radiusClass(theme.buttonRadius))}
              style={{ backgroundColor: primary }}
            >
              {form.submitLabel}
            </span>
          </div>
          {form.recaptcha && <p className="mt-2 text-center text-[10px] text-neutral-400">Protected by reCAPTCHA</p>}
        </div>
      );
    }
    case "countdown":
      return (
        <div className={cn("flex gap-3", block.align === "center" ? "justify-center" : block.align === "right" ? "justify-end" : "justify-start")}>
          {["02", "18", "45", "30"].map((n, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="flex size-14 items-center justify-center rounded-xl bg-neutral-900 text-2xl font-bold tabular-nums text-white">
                {n}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-wide text-neutral-400">
                {["Days", "Hours", "Min", "Sec"][i]}
              </span>
            </div>
          ))}
        </div>
      );
    case "pricing":
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          {(block.pricing ?? []).map((t) => (
            <div
              key={t.id}
              className={cn(
                "flex flex-col rounded-2xl border p-5",
                t.highlighted ? "border-transparent shadow-lg ring-2" : "border-neutral-200"
              )}
              style={t.highlighted ? ({ "--tw-ring-color": primary } as React.CSSProperties) : undefined}
            >
              <p className="text-sm font-semibold text-neutral-500">{t.name}</p>
              <p className="mt-2 text-3xl font-bold text-neutral-900">
                {t.price}
                {t.period && <span className="text-sm font-normal text-neutral-400">{t.period}</span>}
              </p>
              <ul className="mt-4 flex-1 space-y-1.5">
                {t.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-600">
                    <Check className="size-4" style={{ color: primary }} /> {f}
                  </li>
                ))}
              </ul>
              <span
                className="mt-4 inline-flex justify-center rounded-lg py-2 text-sm font-semibold"
                style={t.highlighted ? { backgroundColor: primary, color: "#fff" } : { border: `1.5px solid ${primary}`, color: primary }}
              >
                {t.ctaLabel || "Choose"}
              </span>
            </div>
          ))}
        </div>
      );
    case "testimonial":
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {(block.testimonials ?? []).map((t) => (
            <figure key={t.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-3 text-[15px] leading-relaxed text-neutral-700">“{t.quote}”</blockquote>
              <figcaption className="mt-3 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600">
                  {t.author.charAt(0)}
                </span>
                <span className="text-sm">
                  <span className="font-medium text-neutral-900">{t.author}</span>
                  {t.role && <span className="block text-xs text-neutral-400">{t.role}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      );
    case "stats":
      return (
        <div className="grid grid-cols-3 gap-4">
          {(block.stats ?? []).map((s) => (
            <div key={s.id} className="text-center">
              <p className="text-3xl font-bold text-neutral-900" style={{ color: primary }}>
                {s.value}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{s.label}</p>
            </div>
          ))}
        </div>
      );
    case "faq":
      return (
        <div className="mx-auto max-w-2xl divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
          {(block.faqs ?? []).map((f) => (
            <div key={f.id} className="p-4">
              <p className="text-sm font-medium text-neutral-900">{f.question}</p>
              <p className="mt-1 text-sm text-neutral-500">{f.answer}</p>
            </div>
          ))}
        </div>
      );
    case "socialIcons":
      return (
        <div className={cn("flex gap-3", block.align === "center" ? "justify-center" : block.align === "right" ? "justify-end" : "justify-start")}>
          {(block.socials ?? []).map((s) => (
            <span key={s} className="flex size-9 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-white">
              {SOCIAL_LETTERS[s] ?? s.charAt(0).toUpperCase()}
            </span>
          ))}
        </div>
      );
    case "navbar":
      return (
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-neutral-900">{block.text || "Brand"}</span>
          <div className="flex items-center gap-5 text-sm text-neutral-600">
            {(block.navLinks ?? []).map((l) => (
              <span key={l.id}>{l.label}</span>
            ))}
            <span className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white" style={{ backgroundColor: primary }}>
              Get started
            </span>
          </div>
        </div>
      );
    case "footer":
      return (
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex gap-3">
            {(block.socials ?? []).map((s) => (
              <span key={s} className="flex size-8 items-center justify-center rounded-full bg-neutral-700 text-[11px] font-semibold text-white">
                {SOCIAL_LETTERS[s] ?? s.charAt(0).toUpperCase()}
              </span>
            ))}
          </div>
          <p className="text-xs text-neutral-400">{block.text || "© Company"}</p>
        </div>
      );
    case "divider":
      return <hr className="border-neutral-200" />;
    case "spacer":
      return <div style={{ height: block.height ?? 32 }} />;
    case "html":
      return (
        <div className="rounded border border-dashed border-neutral-300 bg-neutral-50 p-3 font-mono text-xs text-neutral-500">
          {block.html?.trim() ? block.html : "<!-- custom HTML / embed -->"}
        </div>
      );
    default:
      return null;
  }
}
