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
  return <PolicySlideshow />;
}
