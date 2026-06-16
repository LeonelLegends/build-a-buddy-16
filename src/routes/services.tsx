import { createFileRoute } from "@tanstack/react-router";
import { PolicySlideshow } from "@/components/PolicySlideshow";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Legends Insurance" },
      {
        name: "description",
        content:
          "Explore our insurance policies: HYSA, 401(k), Roth IRA, Life Insurance, Living Benefits, Term Life, Permanent Life, IUL, and Annuities.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Our Insurance Services
        </h1>
      </section>
      <PolicySlideshow />
    </main>
  );
}
