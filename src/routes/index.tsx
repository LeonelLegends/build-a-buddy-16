import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import heroImg from "@/assets/hero.webp";
import familyImg from "@/assets/family.webp";
import { PolicySlideshow } from "@/components/PolicySlideshow";


const SITE = "https://legendsinsuranceservices.lovable.app";
const HOME_TITLE = "Legends Insurance Services | Financial Protection & Retirement in Sarasota, FL";
const HOME_DESC =
  "Life insurance, annuities & retirement plans in Sarasota, FL. Bilingual independent agency — book your free consultation today.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESC },
      { property: "og:title", content: HOME_TITLE },
      { property: "og:description", content: HOME_DESC },
      { property: "og:url", content: `${SITE}/` },
      { name: "twitter:title", content: HOME_TITLE },
      { name: "twitter:description", content: HOME_DESC },
    ],
    links: [{ rel: "canonical", href: `${SITE}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "InsuranceAgency",
          name: "Legends Insurance Services",
          url: SITE,
          telephone: "+1-941-265-0210",
          email: "support@legendsinsuranceservices.com",
          image: `${SITE}/favicon.jpg`,
          address: {
            "@type": "PostalAddress",
            addressLocality: "Sarasota",
            addressRegion: "FL",
            postalCode: "34231",
            addressCountry: "US",
          },
          areaServed: { "@type": "State", name: "Florida" },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "09:00",
              closes: "18:00",
            },
          ],
          sameAs: [
            "https://www.facebook.com/profile.php?id=61586608498612",
            "https://www.instagram.com/legendsinsuranceservices/",
          ],
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t } = useI18n();


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
            decoding="async"
            fetchPriority="high"
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
                className="btn-teal inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold"
              >
                {t("hero.cta")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="btn-teal inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold"
              >
                {t("hero.cta2")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-cream" aria-labelledby="trust-heading">
        <h2 id="trust-heading" className="sr-only">
          {t("trust.title")}
        </h2>
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

      {/* Policies slideshow */}
      <PolicySlideshow />


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
              decoding="async"
              className="rounded-3xl shadow-elegant"
            />
            
          </div>
          <div>
            <h2 className="font-display text-3xl text-primary md:text-4xl">{t("about.title")}</h2>
            <p className="mt-4 text-foreground/80">{t("about.body")}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {[t("about.value1"), t("about.value2"), t("about.value3")].map((v) => (
                <li key={v} className="flex items-center gap-3">
                  <span className="icon-teal grid h-6 w-6 place-items-center rounded-full">
                    <Shield className="h-3.5 w-3.5 text-secondary" />
                  </span>
                  <span className="font-medium text-primary">{v}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="btn-teal mt-8 inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold"
            >
              {t("hero.cta")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
