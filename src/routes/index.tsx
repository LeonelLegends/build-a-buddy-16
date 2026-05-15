import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  TrendingUp,
  Heart,
  Shield,
  Briefcase,
  Building2,
  PiggyBank,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/hero.jpg";
import familyImg from "@/assets/family.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Legends Insurance Services — Family-First Financial Protection" },
      {
        name: "description",
        content:
          "Annuities, life insurance, and employee benefit packages tailored to your family and business. Bilingual independent agency.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t } = useI18n();

  const services = [
    { icon: TrendingUp, title: t("services.annuities.title"), desc: t("services.annuities.desc") },
    { icon: PiggyBank, title: t("services.iul.title"), desc: t("services.iul.desc") },
    { icon: Heart, title: t("services.whole.title"), desc: t("services.whole.desc") },
    { icon: Shield, title: t("services.term.title"), desc: t("services.term.desc") },
    { icon: Briefcase, title: t("services.benefits.title"), desc: t("services.benefits.desc") },
    { icon: Building2, title: t("services.cafeteria.title"), desc: t("services.cafeteria.desc") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-30">
          <img
            src={heroImg}
            alt=""
            width={1600}
            height={1200}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/70 to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-5 md:py-28">
          <div className="md:col-span-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-primary-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {t("hero.eyebrow")}
            </span>
            <h1 className="mt-6 font-display text-4xl leading-tight md:text-6xl md:leading-[1.05]">
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-gold px-5 py-3 text-sm font-semibold text-primary shadow-gold transition-transform hover:-translate-y-0.5"
              >
                {t("hero.cta")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-5 py-3 text-sm font-semibold text-primary-foreground hover:border-gold hover:text-gold"
              >
                {t("hero.cta2")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-cream">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-4">
          {[
            { n: "25+", l: t("trust.years") },
            { n: "5,000+", l: t("trust.families") },
            { n: "200+", l: t("trust.businesses") },
            { n: "98%", l: t("trust.rating") },
          ].map((s) => (
            <div key={s.l} className="text-center md:text-left">
              <p className="font-display text-3xl font-semibold text-primary md:text-4xl">{s.n}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl text-primary md:text-4xl">{t("services.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("services.subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-elegant"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-hero">
                <s.icon className="h-6 w-6 text-gold" />
              </span>
              <h3 className="mt-5 font-display text-xl text-primary">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Family / story */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
          <div className="relative">
            <img
              src={familyImg}
              alt="A family enjoying time together"
              width={1400}
              height={1000}
              loading="lazy"
              className="rounded-3xl shadow-elegant"
            />
            <div className="absolute -bottom-6 -right-6 hidden h-32 w-32 rounded-3xl bg-gradient-gold shadow-gold md:block" />
          </div>
          <div>
            <h2 className="font-display text-3xl text-primary md:text-4xl">{t("about.title")}</h2>
            <p className="mt-4 text-foreground/80">{t("about.body")}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {[t("about.value1"), t("about.value2"), t("about.value3")].map((v) => (
                <li key={v} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-gold text-primary">
                    <Shield className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium text-primary">{v}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-secondary"
            >
              {t("hero.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
