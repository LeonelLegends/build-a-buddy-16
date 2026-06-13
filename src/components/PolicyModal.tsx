import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { POLICIES } from "@/components/PolicySlideshow";

type Props = {
  policyTitleEn: string;
  open: boolean;
  onClose: () => void;
};

export function PolicyModal({ policyTitleEn, open, onClose }: Props) {
  const { lang } = useI18n();
  const policy = POLICIES.find((p) => p.title.en === policyTitleEn);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !policy) return null;

  const learnMore = lang === "es" ? "Conoce más" : "Learn more";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in-0"
      role="dialog"
      aria-modal="true"
      aria-label={policy.title[lang]}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <article className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-elegant animate-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="overflow-hidden rounded-xl">
          <img
            src={policy.image}
            alt={policy.title[lang]}
            width={800}
            height={576}
            className="h-56 w-full object-cover"
          />
        </div>
        <div className="flex flex-1 flex-col px-2 pt-6 pb-4">
          <h3 className={`font-display text-2xl font-bold ${policy.color}`}>{policy.title[lang]}</h3>
          <p className="mt-4 text-sm font-semibold text-foreground">{policy.desc[lang]}</p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {policy.bullets[lang].map((b) => (
              <li key={b} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-5">
            <Link
              to="/contact"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {learnMore} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
