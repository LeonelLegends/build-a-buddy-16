import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Coins, ListChecks, FileCheck2, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import teamImg from "@/assets/team.jpg";

export const Route = createFileRoute("/benefits")({
  head: () => ({
    meta: [
      { title: "Employee Benefits & Section 125 Plans | Legends Insurance" },
      {
        name: "description",
        content:
          "Specialized employee benefit packages and Section 125 cafeteria plans for companies with 50+ full-time employees. Tax-advantaged, fully managed.",
      },
      { property: "og:url", content: "https://build-a-buddy-16.lovable.app/benefits" },
    ],
    links: [{ rel: "canonical", href: "https://build-a-buddy-16.lovable.app/benefits" }],
  }),
  component: BenefitsPage,
});

function BenefitsPage() {
  const { t } = useI18n();

  const points = [
    { icon: Coins, title: t("benefits.point1.title"), desc: t("benefits.point1.desc") },
    { icon: ListChecks, title: t("benefits.point2.title"), desc: t("benefits.point2.desc") },
    { icon: FileCheck2, title: t("benefits.point3.title"), desc: t("benefits.point3.desc") },
    { icon: Users, title: t("benefits.point4.title"), desc: t("benefits.point4.desc") },
  ];

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            {t("nav.benefits")}
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-4xl md:text-5xl">
            {t("benefits.title")}
          </h1>
          <p className="mt-4 max-w-2xl text-primary-foreground/80">{t("benefits.subtitle")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <img
            src={teamImg}
            alt="Diverse team collaborating in a modern office"
            width={1400}
            height={1000}
            loading="lazy"
            className="rounded-3xl shadow-elegant"
          />
          <div className="space-y-6">
            {points.map((p) => (
              <div key={p.title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-gold">
                  <p.icon className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h2 className="font-display text-xl text-primary">{p.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-3xl bg-cream p-10 text-center md:p-14">
          <h2 className="mx-auto max-w-2xl font-display text-3xl text-primary">
            {t("benefits.cta")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("contact.subtitle")}</p>
          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-secondary"
          >
            {t("nav.cta")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
