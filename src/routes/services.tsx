import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, PiggyBank, Heart, Shield, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Annuities, IUL, Whole & Term Life | Legends Insurance" },
      {
        name: "description",
        content:
          "Annuities, Indexed Universal Life (IUL), whole life, and term life insurance — independent advice for individuals and families.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { t } = useI18n();

  const items = [
    {
      icon: TrendingUp,
      title: t("services.annuities.title"),
      desc: t("services.annuities.desc"),
      bullets: [
        "Fixed, indexed, and immediate options",
        "Predictable retirement income",
        "Tax-deferred growth potential",
      ],
    },
    {
      icon: PiggyBank,
      title: t("services.iul.title"),
      desc: t("services.iul.desc"),
      bullets: [
        "Cash value linked to market index",
        "Downside protection",
        "Tax-advantaged access",
      ],
    },
    {
      icon: Heart,
      title: t("services.whole.title"),
      desc: t("services.whole.desc"),
      bullets: [
        "Lifelong coverage",
        "Guaranteed cash value growth",
        "Potential dividends",
      ],
    },
    {
      icon: Shield,
      title: t("services.term.title"),
      desc: t("services.term.desc"),
      bullets: [
        "10, 20, or 30-year terms",
        "Affordable premiums",
        "Convertible options",
      ],
    },
  ];

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            {t("nav.services")}
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl">
            {t("services.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/80">{t("services.subtitle")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {items.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-border bg-card p-7 transition-all hover:border-gold/60 hover:shadow-elegant"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-gold">
                <s.icon className="h-6 w-6 text-primary" />
              </span>
              <h2 className="mt-5 font-display text-2xl text-primary">{s.title}</h2>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span className="text-foreground/80">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-primary p-10 text-primary-foreground md:p-14">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="font-display text-2xl md:text-3xl">{t("hero.cta")}</h3>
              <p className="mt-2 max-w-md text-primary-foreground/75">
                {t("contact.subtitle")}
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary shadow-gold"
            >
              {t("nav.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
