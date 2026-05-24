export type PipelineStage =
  | "New Lead"
  | "Appointment Scheduled"
  | "Proposal Sent"
  | "Sales Closed"
  | "Future Follow-up";

export type Priority = "Low" | "Medium" | "High";
export type MessageChannel = "whatsapp" | "email" | "sms";

export const PIPELINE_STAGES: PipelineStage[] = [
  "New Lead",
  "Appointment Scheduled",
  "Proposal Sent",
  "Sales Closed",
  "Future Follow-up",
];

export const STAGE_COLORS: Record<PipelineStage, string> = {
  "New Lead": "border-t-sky-500 bg-sky-50",
  "Appointment Scheduled": "border-t-violet-500 bg-violet-50",
  "Proposal Sent": "border-t-amber-500 bg-amber-50",
  "Sales Closed": "border-t-emerald-500 bg-emerald-50",
  "Future Follow-up": "border-t-slate-400 bg-slate-50",
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  High: "bg-rose-100 text-rose-800 border-rose-200",
};

export type CrmLead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  age: number | null;
  insurance_type: string | null;
  priority: Priority;
  smoker: boolean;
  beneficiaries: string | null;
  pipeline_status: PipelineStage;
  position: number;
  interest: string | null;
  message: string | null;
  created_at: string;
};

export function renderTemplate(body: string, name: string) {
  return body.replace(/\{\{\s*name\s*\}\}/gi, name || "there");
}

export function sanitizePhone(phone: string | null | undefined) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

export function waLink(phone: string | null | undefined, message: string) {
  const p = sanitizePhone(phone);
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}

export function smsLink(phone: string | null | undefined, message: string) {
  const p = phone ? phone.replace(/[^\d+]/g, "") : "";
  return `sms:${p}?&body=${encodeURIComponent(message)}`;
}

export function mailtoLink(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
