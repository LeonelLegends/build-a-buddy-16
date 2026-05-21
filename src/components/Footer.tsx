import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import logo from "@/assets/logo.jpg";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Legends Insurance Services" className="h-11 w-auto rounded-md bg-white/5 p-1" />
            <span className="font-display text-lg font-semibold leading-tight">
              Legends <span className="text-gold">Insurance Services</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/70">
            {t("footer.tagline")}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
            {t("nav.services")}
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            <li><Link to="/services" className="hover:text-gold">{t("services.annuities.title")}</Link></li>
            <li><Link to="/services" className="hover:text-gold">{t("services.iul.title")}</Link></li>
            <li><Link to="/services" className="hover:text-gold">{t("services.whole.title")}</Link></li>
            <li><Link to="/benefits" className="hover:text-gold">{t("services.cafeteria.title")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">
            {t("nav.contact")}
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> (941) 265-0210</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /> jeff@legendsinsuranceservices.com</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> United States</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-primary-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} Legends Insurance Services. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-gold">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold">Terms of Service</Link>
            <span>Licensed insurance professionals.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

