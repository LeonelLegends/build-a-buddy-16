import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "es";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.services": "Services",
  "nav.benefits": "Section 125 Plans",
  "nav.contact": "Contact",
  "nav.cta": "Free Consultation",

  "hero.eyebrow": "Legends Insurance Services",
  "hero.title": "Protect today. Build a legendary tomorrow.",
  "hero.subtitle":
    "Annuities, life insurance, and employee benefit packages designed around your family and your business.",
  "hero.cta": "Talk with an advisor",
  "hero.cta2": "Explore services",

  "trust.title": "Trusted guidance for every stage",
  "trust.years": "Years of experience",
  "trust.families": "Families served",
  "trust.businesses": "Businesses protected",
  "trust.rating": "Client satisfaction",

  "services.title": "What we offer",
  "services.subtitle": "Personal protection and business benefits — all under one roof.",
  "services.annuities.title": "Annuities",
  "services.annuities.desc": "Reliable retirement income streams tailored to your goals.",
  "services.iul.title": "Indexed Universal Life (IUL)",
  "services.iul.desc": "Tax-advantaged growth with lifelong protection.",
  "services.whole.title": "Whole Life",
  "services.whole.desc": "Permanent coverage that builds cash value over time.",
  "services.term.title": "Term Life",
  "services.term.desc": "Affordable coverage for the years that matter most.",
  "services.cafeteria.title": "Section 125 Cafeteria Plans",
  "services.cafeteria.desc":
    "Pre-tax employee benefit programs for companies with 50+ full-time employees — saving your team and your business money.",
  "services.learn": "Learn more",

  "benefits.title": "Section 125 Cafeteria Plans",
  "benefits.subtitle":
    "Pre-tax employee benefit programs for companies with 50 or more full-time employees — saving your team and your business money.",
  "benefits.point1.title": "Tax savings for everyone",
  "benefits.point1.desc":
    "Section 125 plans let employees pay for benefits with pre-tax dollars — reducing payroll taxes for your business too.",
  "benefits.point2.title": "Customized benefit menu",
  "benefits.point2.desc":
    "Health, dental, vision, FSA, dependent care, and supplemental coverage — built for your workforce.",
  "benefits.point3.title": "Compliance handled",
  "benefits.point3.desc":
    "We manage plan documents, nondiscrimination testing, and annual reviews so you stay compliant.",
  "benefits.point4.title": "Dedicated support",
  "benefits.point4.desc":
    "A real human advisor for your HR team and on-site enrollment for your employees.",
  "benefits.cta": "Request a benefits proposal",

  "about.title": "Built on trust. Powered by people.",
  "about.body":
    "Legends Insurance Services is an independent agency dedicated to protecting families and helping businesses thrive. We work with top-rated carriers to find the right fit — never a one-size-fits-all policy.",
  "about.value1": "Independent advice",
  "about.value2": "Bilingual service",
  "about.value3": "Long-term partnership",

  "contact.title": "Get in touch",
  "contact.subtitle": "Tell us a little about your needs and we'll be in touch within one business day.",
  "contact.name": "Full name",
  "contact.email": "Email",
  "contact.phone": "Phone",
  "contact.interest": "I'm interested in",
  "contact.message": "Message",
  "contact.submit": "Send message",
  "contact.thanks": "Thanks! We'll be in touch shortly.",
  "contact.phoneLabel": "Phone",
  "contact.emailLabel": "Email",
  "contact.hoursLabel": "Hours",
  "contact.hoursValue": "Mon–Fri, 9am – 6pm ET",

  "footer.tagline": "Family-first financial protection.",
  "footer.rights": "All rights reserved.",

  "chat.title": "Chat with Legends",
  "chat.subtitle": "Ask about plans, products, or scheduling.",
  "chat.placeholder": "Type your message…",
  "chat.send": "Send",
  "chat.greeting":
    "Hi! I'm the Legends Insurance virtual assistant. How can I help you today — life insurance, annuities, or employee benefits?",
  "chat.error": "Sorry, something went wrong. Please try again.",
  "chat.rate": "We're getting a lot of questions right now. Please wait a moment and try again.",

  "lang.toggle": "Español",
};

const es: Dict = {
  "nav.home": "Inicio",
  "nav.services": "Servicios",
  "nav.benefits": "Sección 125",
  "nav.contact": "Contacto",
  "nav.cta": "Consulta gratuita",

  "hero.eyebrow": "Legends Insurance Services",
  "hero.title": "Protege hoy. Construye un mañana legendario.",
  "hero.subtitle":
    "Anualidades, seguros de vida y planes de beneficios para empleados diseñados para tu familia y tu negocio.",
  "hero.cta": "Habla con un asesor",
  "hero.cta2": "Ver servicios",

  "trust.title": "Asesoría confiable en cada etapa",
  "trust.years": "Años de experiencia",
  "trust.families": "Familias atendidas",
  "trust.businesses": "Empresas protegidas",
  "trust.rating": "Satisfacción del cliente",

  "services.title": "Lo que ofrecemos",
  "services.subtitle": "Protección personal y beneficios empresariales — todo en un solo lugar.",
  "services.annuities.title": "Anualidades",
  "services.annuities.desc": "Ingresos confiables para tu retiro adaptados a tus metas.",
  "services.iul.title": "Vida Universal Indexada (IUL)",
  "services.iul.desc": "Crecimiento con ventajas fiscales y protección de por vida.",
  "services.whole.title": "Vida Entera",
  "services.whole.desc": "Cobertura permanente que acumula valor en efectivo.",
  "services.term.title": "Vida a Término",
  "services.term.desc": "Cobertura accesible para los años que más importan.",
  "services.cafeteria.title": "Planes Cafetería Sección 125",
  "services.cafeteria.desc":
    "Programas de beneficios pre-impuestos para empresas con más de 50 empleados a tiempo completo — ahorrando dinero a tu equipo y a tu negocio.",
  "services.learn": "Más información",

  "benefits.title": "Planes Cafetería Sección 125",
  "benefits.subtitle":
    "Programas de beneficios pre-impuestos para empresas con 50 o más empleados a tiempo completo — ahorrando dinero a tu equipo y a tu negocio.",
  "benefits.point1.title": "Ahorros fiscales para todos",
  "benefits.point1.desc":
    "Los planes Sección 125 permiten a los empleados pagar beneficios con dólares pre-impuestos — reduciendo también los impuestos de nómina de tu empresa.",
  "benefits.point2.title": "Menú de beneficios personalizado",
  "benefits.point2.desc":
    "Salud, dental, visión, FSA, cuidado de dependientes y coberturas suplementarias.",
  "benefits.point3.title": "Cumplimiento normativo",
  "benefits.point3.desc":
    "Manejamos documentos del plan, pruebas de no discriminación y revisiones anuales.",
  "benefits.point4.title": "Soporte dedicado",
  "benefits.point4.desc":
    "Un asesor real para tu equipo de RR.HH. y inscripción en sitio para tus empleados.",
  "benefits.cta": "Solicita una propuesta",

  "about.title": "Construido sobre la confianza. Impulsado por personas.",
  "about.body":
    "Legends Insurance Services es una agencia independiente dedicada a proteger familias y ayudar a las empresas a prosperar. Trabajamos con aseguradoras de primer nivel para encontrar lo que mejor se adapta a ti.",
  "about.value1": "Asesoría independiente",
  "about.value2": "Servicio bilingüe",
  "about.value3": "Relación a largo plazo",

  "contact.title": "Contáctanos",
  "contact.subtitle": "Cuéntanos un poco sobre tus necesidades y te responderemos en un día hábil.",
  "contact.name": "Nombre completo",
  "contact.email": "Correo electrónico",
  "contact.phone": "Teléfono",
  "contact.interest": "Me interesa",
  "contact.message": "Mensaje",
  "contact.submit": "Enviar mensaje",
  "contact.thanks": "¡Gracias! Te contactaremos pronto.",
  "contact.phoneLabel": "Teléfono",
  "contact.emailLabel": "Correo",
  "contact.hoursLabel": "Horario",
  "contact.hoursValue": "Lun–Vie, 9am – 6pm ET",

  "footer.tagline": "Protección financiera centrada en la familia.",
  "footer.rights": "Todos los derechos reservados.",

  "chat.title": "Chatea con Legends",
  "chat.subtitle": "Pregunta sobre planes, productos o citas.",
  "chat.placeholder": "Escribe tu mensaje…",
  "chat.send": "Enviar",
  "chat.greeting":
    "¡Hola! Soy el asistente virtual de Legends Insurance. ¿En qué puedo ayudarte — seguros de vida, anualidades o beneficios para empleados?",
  "chat.error": "Lo siento, algo salió mal. Inténtalo de nuevo.",
  "chat.rate": "Estamos recibiendo muchas consultas. Espera un momento e inténtalo de nuevo.",

  "lang.toggle": "English",
};

const dicts: Record<Lang, Dict> = { en, es };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("legends-lang") : null;
    if (stored === "en" || stored === "es") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("legends-lang", l);
  };

  const t = (key: string) => dicts[lang][key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
