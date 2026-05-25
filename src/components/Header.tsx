import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/logo.jpg";

export function Header() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/benefits", label: t("nav.benefits") },
    { to: "/contact", label: t("nav.contact") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="Legends Insurance Services">
          <img src={logo} alt="Legends Insurance Services" className="h-11 w-auto rounded-md" />
          <span className="font-display font-semibold leading-tight font-sans text-2xl text-slate-950">
            Legends Insurance Services
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/login"
            className="rounded-md bg-logo-green px-4 py-2 text-sm font-semibold text-logo-green-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {t("nav.login") ?? "Login"}
          </Link>
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="rounded-md bg-logo-green px-4 py-2 text-sm font-semibold uppercase tracking-wide text-logo-green-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {t("lang.toggle")}
          </button>
          <Link
            to="/contact"
            className="rounded-md bg-logo-green px-4 py-2 text-sm font-semibold text-logo-green-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {t("nav.cta")}
          </Link>
        </div>

        <button
          className="lg:hidden text-primary"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted"
                activeProps={{ className: "bg-muted text-primary font-semibold" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="mt-2 rounded-md bg-logo-green px-4 py-2 text-sm font-semibold uppercase tracking-wide text-logo-green-foreground text-center"
            >
              {t("lang.toggle")}
            </button>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="rounded-md bg-logo-green px-4 py-2.5 text-center text-sm font-semibold text-logo-green-foreground"
            >
              {t("nav.login") ?? "Login"}
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="rounded-md bg-logo-green px-4 py-2.5 text-center text-sm font-semibold text-logo-green-foreground"
            >
              {t("nav.cta")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
