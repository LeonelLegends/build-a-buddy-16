import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTemplates, type Templates } from "@/hooks/use-templates";
import { MessageCircle, Mail, Phone } from "lucide-react";
import type { MessageChannel } from "@/lib/crm";

export const Route = createFileRoute("/crm/settings")({
  component: SettingsPage,
});

const CHANNELS: { key: MessageChannel; label: string; icon: typeof Mail; hint: string }[] = [
  { key: "whatsapp", label: "WhatsApp message", icon: MessageCircle, hint: "Sent via wa.me link. Use {{name}} for the lead's first name." },
  { key: "email", label: "Email body", icon: Mail, hint: "Used in the mailto link. Use {{name}} for personalization." },
  { key: "sms", label: "SMS message", icon: Phone, hint: "Sent via the device's SMS app. Keep it short." },
];

function SettingsPage() {
  const { templates, setTemplates, loaded } = useTemplates();
  const [saving, setSaving] = useState<MessageChannel | null>(null);

  const save = async (channel: MessageChannel) => {
    setSaving(channel);
    const { error } = await supabase
      .from("message_templates")
      .upsert({ channel, name: channel, body: templates[channel], updated_at: new Date().toISOString() }, { onConflict: "channel" });
    setSaving(null);
    if (error) toast.error(error.message);
    else toast.success("Template saved");
  };

  const update = (channel: MessageChannel, body: string) => {
    setTemplates({ ...templates, [channel]: body } as Templates);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Message templates</h1>
        <p className="mt-1 text-sm text-slate-600">Edit the auto-filled text for your quick actions.</p>
      </div>

      {!loaded ? (
        <div className="text-sm text-slate-500">Loading…</div>
      ) : (
        <div className="space-y-4">
          {CHANNELS.map(({ key, label, icon: Icon, hint }) => (
            <div key={key} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
              </div>
              <Textarea
                rows={key === "email" ? 8 : 4}
                value={templates[key]}
                onChange={(e) => update(key, e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">{hint}</p>
              <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={() => save(key)} disabled={saving === key}>
                  {saving === key ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
