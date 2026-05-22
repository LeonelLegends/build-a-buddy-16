import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, Clock, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Legends Insurance Services" },
      {
        name: "description",
        content:
          "Get in touch with Legends Insurance Services for a free consultation on annuities, life insurance, or employee benefit packages.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { t } = useI18n();
  const [sent, setSent] = useState(false);

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">
            {t("nav.contact")}
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">{t("contact.title")}</h1>
          <p className="mt-4 max-w-xl text-primary-foreground/80">{t("contact.subtitle")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-gold">
                  <Phone className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("contact.phoneLabel")}
                  </p>
                  <p className="font-medium text-primary">(941) 265-0210</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-gold">
                  <Mail className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("contact.emailLabel")}
                  </p>
                  <p className="font-medium text-primary">jeff@legendsinsuranceservices.com</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-gold">
                  <Clock className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("contact.hoursLabel")}
                  </p>
                  <p className="font-medium text-primary">{t("contact.hoursValue")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            {sent ? (
              <div className="rounded-2xl border border-gold/40 bg-cream p-10 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
                <h2 className="mt-4 font-display text-2xl text-primary">{t("contact.thanks")}</h2>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="rounded-2xl border border-border bg-card p-7 shadow-elegant"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("contact.name")} name="name" required />
                  <Field label={t("contact.email")} name="email" type="email" required />
                  <Field label={t("contact.phone")} name="phone" type="tel" />
                  <div className="flex flex-col">
                    <label className="mb-1.5 text-sm font-medium text-foreground/80">
                      {t("contact.interest")}
                    </label>
                    <select
                      name="interest"
                      className="rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
                    >
                      <option>{t("services.annuities.title")}</option>
                      <option>{t("services.iul.title")}</option>
                      <option>{t("services.whole.title")}</option>
                      <option>{t("services.term.title")}</option>
                      <option>{t("services.cafeteria.title")}</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex flex-col">
                  <label className="mb-1.5 text-sm font-medium text-foreground/80">
                    {t("contact.message")}
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    className="rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-md bg-gradient-gold px-5 py-3 text-sm font-semibold text-primary shadow-gold transition-transform hover:-translate-y-0.5"
                >
                  {t("contact.submit")}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1.5 text-sm font-medium text-foreground/80">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
      />
    </div>
  );
}
