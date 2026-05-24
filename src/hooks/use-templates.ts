import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MessageChannel } from "@/lib/crm";

export type Templates = { whatsapp: string; email: string; sms: string };

const FALLBACK: Templates = {
  whatsapp: "Hello {{name}}, I'm your insurance advisor.",
  email: "Hi {{name}},\n\nFollowing up about your insurance options.",
  sms: "Hi {{name}}, your insurance advisor here.",
};

export function useTemplates() {
  const [templates, setTemplates] = useState<Templates>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("message_templates").select("channel, body");
      if (data) {
        const next = { ...FALLBACK };
        for (const row of data) {
          next[row.channel as MessageChannel] = row.body;
        }
        setTemplates(next);
      }
      setLoaded(true);
    })();
  }, []);

  return { templates, setTemplates, loaded };
}
