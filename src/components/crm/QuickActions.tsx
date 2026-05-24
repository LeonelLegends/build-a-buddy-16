import { MessageCircle, Mail, Phone } from "lucide-react";
import { mailtoLink, renderTemplate, smsLink, waLink, type CrmLead } from "@/lib/crm";

type Templates = { whatsapp: string; email: string; sms: string };

export function QuickActions({
  lead,
  templates,
  size = "sm",
}: {
  lead: Pick<CrmLead, "name" | "phone" | "email">;
  templates: Templates;
  size?: "sm" | "md";
}) {
  const wa = renderTemplate(templates.whatsapp, lead.name);
  const em = renderTemplate(templates.email, lead.name);
  const sm = renderTemplate(templates.sms, lead.name);
  const sizeCls = size === "md" ? "h-9 w-9" : "h-7 w-7";
  const iconCls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="flex items-center gap-1.5">
      <a
        href={lead.phone ? waLink(lead.phone, wa) : "#"}
        target="_blank"
        rel="noreferrer"
        onClick={stop}
        title="WhatsApp"
        className={`${sizeCls} inline-flex items-center justify-center rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ${!lead.phone ? "pointer-events-none opacity-40" : ""}`}
      >
        <MessageCircle className={iconCls} />
      </a>
      <a
        href={mailtoLink(lead.email, "Following up", em)}
        onClick={stop}
        title="Email"
        className={`${sizeCls} inline-flex items-center justify-center rounded-md bg-sky-100 text-sky-700 hover:bg-sky-200`}
      >
        <Mail className={iconCls} />
      </a>
      <a
        href={lead.phone ? smsLink(lead.phone, sm) : "#"}
        onClick={stop}
        title="SMS"
        className={`${sizeCls} inline-flex items-center justify-center rounded-md bg-violet-100 text-violet-700 hover:bg-violet-200 ${!lead.phone ? "pointer-events-none opacity-40" : ""}`}
      >
        <Phone className={iconCls} />
      </a>
    </div>
  );
}
