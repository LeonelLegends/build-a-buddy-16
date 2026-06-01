import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

import imgHysa from "@/assets/policy-hysa.jpg";
import img401k from "@/assets/policy-401k.jpg";
import imgRoth from "@/assets/policy-roth.jpg";
import imgLife from "@/assets/policy-life.jpg";
import imgLiving from "@/assets/policy-living.jpg";
import imgTerm from "@/assets/policy-term.jpg";
import imgPermanent from "@/assets/policy-permanent.jpg";
import imgIul from "@/assets/policy-iul.jpg";
import imgAnnuities from "@/assets/policy-annuities.jpg";

type Policy = {
  image: string;
  color: string; // tailwind text color class — sampled from logo palette
  title: { en: string; es: string };
  desc: { en: string; es: string };
  bullets: { en: string[]; es: string[] };
};

// Title colors cycle through the logo palette (navy/primary, logo green, gold/teal accent)
const POLICIES: Policy[] = [
  {
    image: imgHysa,
    color: "text-primary",
    title: { en: "High Yield Savings Account (HYSA)", es: "Cuenta de Ahorros de Alto Rendimiento (HYSA)" },
    desc: {
      en: "Similar to a traditional savings account, but with much higher interest rates.",
      es: "Es similar a una cuenta de ahorros tradicional, pero ofrece tasas de interés mucho más altas.",
    },
    bullets: {
      en: [
        "Earns 3%–5% annual interest",
        "FDIC protection for your money",
        "Easy access for emergencies",
        "Ideal for short-term savings",
      ],
      es: [
        "Genera entre 3% y 5% de interés anual",
        "Protección FDIC para tu dinero",
        "Acceso fácil para emergencias",
        "Ideal para ahorros a corto plazo",
      ],
    },
  },
  {
    image: img401k,
    color: "text-logo-green",
    title: { en: "401(k)", es: "401(k)" },
    desc: {
      en: "An employer-offered retirement plan for long-term growth.",
      es: "Un plan de jubilación ofrecido por empleadores para el crecimiento a largo plazo.",
    },
    bullets: {
      en: [
        "Reduces current taxes",
        "Employer match (free money)",
        "Tax-deferred or tax-free growth",
        "Average growth: 6%–10% annually",
      ],
      es: [
        "Reduce los impuestos actuales",
        "Aportes del empleador (dinero gratis)",
        "Crecimiento con impuestos diferidos o libre de impuestos",
        "Crecimiento promedio: 6%–10% anual",
      ],
    },
  },
  {
    image: imgRoth,
    color: "text-gold",
    title: { en: "Roth IRA", es: "Roth IRA" },
    desc: {
      en: "An individual retirement account funded with after-tax money.",
      es: "Una cuenta de jubilación individual financiada con dinero después de impuestos.",
    },
    bullets: {
      en: [
        "Tax-free income in retirement",
        "Flexible investment options",
        "Excellent tax diversification",
        "Growth potential: 6%–10%",
      ],
      es: [
        "Ingresos libres de impuestos en la jubilación",
        "Opciones de inversión flexibles",
        "Excelente diversificación fiscal",
        "Potencial de crecimiento: 6%–10%",
      ],
    },
  },
  {
    image: imgLife,
    color: "text-primary",
    title: { en: "Life Insurance: Protection with Purpose", es: "Seguro de Vida: Protección con Propósito" },
    desc: {
      en: "Life insurance brings peace of mind and financial security for your family.",
      es: "El seguro de vida brinda tranquilidad y seguridad financiera para tu familia.",
    },
    bullets: {
      en: [
        "Income replacement",
        "Debt protection",
        "Final expense coverage",
        "Generational wealth building",
        "Living benefits",
      ],
      es: [
        "Reemplazo de ingresos",
        "Protección de deudas",
        "Cobertura de gastos finales",
        "Construcción de riqueza generacional",
        "Beneficios en vida",
      ],
    },
  },
  {
    image: imgLiving,
    color: "text-logo-green",
    title: { en: "The Power of Living Benefits", es: "El Poder de los Beneficios en Vida" },
    desc: {
      en: "Modern policies let you access benefits while you are still alive.",
      es: "Las pólizas modernas permiten acceder a beneficios mientras aún estás con vida.",
    },
    bullets: {
      en: [
        "Chronic illness benefits",
        "Critical illness benefits",
        "Terminal illness access",
        "Loans and cash value withdrawals",
      ],
      es: [
        "Beneficios por enfermedad crónica",
        "Beneficios por enfermedad crítica",
        "Acceso por enfermedad terminal",
        "Préstamos y retiros del valor en efectivo",
      ],
    },
  },
  {
    image: imgTerm,
    color: "text-gold",
    title: { en: "Term Life Insurance", es: "Seguro de Vida a Término" },
    desc: {
      en: "Economical coverage for a defined period.",
      es: "Cobertura económica por un periodo determinado.",
    },
    bullets: {
      en: ["Low initial cost", "Ideal for temporary needs", "Excellent for young families"],
      es: ["Bajo costo inicial", "Ideal para necesidades temporales", "Excelente para familias jóvenes"],
    },
  },
  {
    image: imgPermanent,
    color: "text-primary",
    title: {
      en: "Permanent Life Insurance (Whole, Universal, IUL)",
      es: "Seguro de Vida Permanente (Whole, Universal, IUL)",
    },
    desc: {
      en: "Lifetime coverage with cash value accumulation.",
      es: "Cobertura de por vida con acumulación de valor en efectivo.",
    },
    bullets: {
      en: [
        "Tax-deferred growth",
        "Access to funds",
        "Estate planning benefits",
        "IUL offers market-linked growth with protection",
      ],
      es: [
        "Crecimiento con impuestos diferidos",
        "Acceso a los fondos",
        "Beneficios de planificación patrimonial",
        "IUL ofrece crecimiento ligado al mercado con protección",
      ],
    },
  },
  {
    image: imgIul,
    color: "text-logo-green",
    title: {
      en: "Benefits of Indexed Universal Life (IUL)",
      es: "Beneficios del Seguro de Vida Universal Indexado (IUL)",
    },
    desc: {
      en: "Combines protection with growth potential.",
      es: "Combina protección con potencial de crecimiento.",
    },
    bullets: {
      en: [
        "Loss protection (0% floor)",
        "Potential for tax-free retirement income",
        "Flexible premiums",
        "Optional living benefit riders",
        "Typical growth: 6%–10% (not guaranteed)",
      ],
      es: [
        "Protección contra pérdidas (piso del 0%)",
        "Potencial de ingresos libres de impuestos en la jubilación",
        "Primas flexibles",
        "Cláusulas opcionales de beneficios en vida",
        "Crecimiento típico: 6%–10% (no garantizado)",
      ],
    },
  },
  {
    image: imgAnnuities,
    color: "text-gold",
    title: { en: "Annuities", es: "Anualidades" },
    desc: {
      en: "Insurance contracts that provide guaranteed growth or future income.",
      es: "Contratos de seguro que ofrecen crecimiento garantizado o ingresos futuros.",
    },
    bullets: {
      en: [
        "Fixed, indexed or variable options",
        "Tax-deferred accumulation",
        "Lifetime income",
        "Typical returns: 3%–6%",
      ],
      es: [
        "Opciones fijas, indexadas o variables",
        "Acumulación con impuestos diferidos",
        "Ingresos de por vida",
        "Rendimientos típicos: 3%–6%",
      ],
    },
  },
];

const PAGE_SIZE = 3;

export function PolicySlideshow() {
  const { lang } = useI18n();
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(POLICIES.length / PAGE_SIZE);

  const title = lang === "es" ? "Las Pólizas que Estás Buscando" : "The Policies You're Looking For";
  const learnMore = lang === "es" ? "Conoce más" : "Learn more";

  const start = page * PAGE_SIZE;
  const visible = POLICIES.slice(start, start + PAGE_SIZE);

  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const next = () => setPage((p) => (p + 1) % totalPages);

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl text-primary md:text-4xl max-w-3xl">{title}</h2>
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={prev}
              aria-label="Previous"
              className="grid h-11 w-11 place-items-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="grid h-11 w-11 place-items-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {visible.map((p) => (
            <article
              key={p.title.en}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="overflow-hidden rounded-xl">
                <img
                  src={p.image}
                  alt={p.title[lang]}
                  width={800}
                  height={576}
                  loading="lazy"
                  className="h-56 w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col px-2 pt-6 pb-4">
                <h3 className={`font-display text-2xl font-bold ${p.color}`}>{p.title[lang]}</h3>
                <p className="mt-4 text-sm font-semibold text-foreground">{p.desc[lang]}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {p.bullets[lang].map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-5">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {learnMore} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === page ? "w-8 bg-primary" : "w-2 bg-primary/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
