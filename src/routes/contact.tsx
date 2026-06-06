import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Phone, Clock, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Calendly?: { initPopupWidget: (opts: { url: string }) => void };
  }
}

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
  const { t, lang } = useI18n();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const linkId = "calendly-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }
    const scriptId = "calendly-js";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <>
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <span className="text-xs font-semibold uppercase tracking-wider text-gold">{t("nav.contact")}</span>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">{t("contact.title")}</h1>
          <p className="mt-4 max-w-xl text-primary-foreground/80">{t("contact.subtitle")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-3 space-y-6 md:order-1">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-elegant">
              <p className="text-sm text-foreground/80">{t("contact.scheduleIntro")}</p>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    window.Calendly?.initPopupWidget({
                      url: "https://calendly.com/leonel-legendsinsurance/30min",
                    })
                  }
                  className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
                  style={{ backgroundColor: "#047857" }}
                >
                  {t("contact.scheduleBtn")}
                </button>
              </div>
            </div>

            {sent ? (
              <div className="rounded-2xl border border-gold/40 bg-cream p-10 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
                <h2 className="mt-4 font-display text-2xl text-primary">{t("contact.thanks")}</h2>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (submitting) return;
                  setSubmitting(true);
                  const fd = new FormData(e.currentTarget);
                  const payload = {
                    name: String(fd.get("name") ?? "").trim(),
                    email: String(fd.get("email") ?? "").trim(),
                    phone: String(fd.get("phone") ?? "").trim() || null,
                    interest: String(fd.get("interest") ?? "").trim() || null,
                    message: String(fd.get("message") ?? "").trim() || null,
                  };
                  const { error } = await supabase.from("leads").insert(payload);
                  setSubmitting(false);
                  if (error) {
                    toast.error("Could not send your message. Please try again.");
                    return;
                  }
                  setSent(true);
                }}
                className="rounded-2xl border border-border bg-card p-7 shadow-elegant"
              >
                <p className="mb-5 text-sm text-foreground/80">{t("contact.formIntro")}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t("contact.name")} name="name" required />
                  <Field label={t("contact.email")} name="email" type="email" required />
                  <Field label={t("contact.phone")} name="phone" type="tel" />
                  <div className="flex flex-col">
                    <label className="mb-1.5 text-sm font-medium text-foreground/80">{t("contact.interest")}</label>
                    <select
                      name="interest"
                      className="rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
                    >
                      <option>HYSA</option>
                      <option>401(k)</option>
                      <option>Roth IRA</option>
                      <option>{lang === "es" ? "Seguro de Vida a Término" : "Term Life Insurance"}</option>
                      <option>{lang === "es" ? "Seguro de Vida Permanente" : "Permanent Life Insurance"}</option>
                      <option>{lang === "es" ? "Anualidades" : "Annuities"}</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex flex-col">
                  <label className="mb-1.5 text-sm font-medium text-foreground/80">{t("contact.message")}</label>
                  <textarea
                    name="message"
                    rows={5}
                    className="rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full rounded-md bg-gradient-gold px-5 py-3 text-sm font-semibold text-primary shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {submitting ? "Sending..." : t("contact.submit")}
                </button>
              </form>
            )}
          </div>

          <div className="md:col-span-2 space-y-6 md:order-2">
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
