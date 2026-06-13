import { createFileRoute } from "@tanstack/react-router";
import { getAllPosts } from "@/lib/blog";

type Msg = { role: "user" | "assistant" | "system"; content: string };

function stripHtml(s: string): string {
  return s
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

type KbEntry = { title: string; summary: string; body: string; slug: string };

let kbCache: { at: number; en: string; es: string } | null = null;
const KB_TTL_MS = 5 * 60 * 1000;
const PER_POST_CHARS = 2000;
const MAX_TOTAL_CHARS = 18000;

async function buildKnowledgeBase(): Promise<{ en: string; es: string }> {
  if (kbCache && Date.now() - kbCache.at < KB_TTL_MS) {
    return { en: kbCache.en, es: kbCache.es };
  }

  const en: KbEntry[] = [];
  const es: KbEntry[] = [];

  try {
    for (const p of getAllPosts()) {
      en.push({
        slug: p.slug,
        title: p.title,
        summary: p.summary ?? "",
        body: stripHtml(p.html || p.content || ""),
      });
    }
  } catch (e) {
    console.error("kb: file posts failed", e);
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("slug,title,summary,body,title_es,summary_es,body_es,published,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    for (const row of data ?? []) {
      en.push({
        slug: row.slug,
        title: row.title,
        summary: row.summary ?? "",
        body: stripHtml(row.body ?? ""),
      });
      if (row.title_es || row.body_es) {
        es.push({
          slug: row.slug,
          title: row.title_es || row.title,
          summary: row.summary_es ?? row.summary ?? "",
          body: stripHtml(row.body_es ?? row.body ?? ""),
        });
      }
    }
  } catch (e) {
    console.error("kb: db posts failed", e);
  }

  const esSource = es.length > 0 ? es : en;

  const format = (entries: KbEntry[]): string => {
    let total = 0;
    const parts: string[] = [];
    for (const e of entries) {
      const body = e.body.slice(0, PER_POST_CHARS);
      const block = `### ${e.title} (/${e.slug})\nSummary: ${e.summary}\n${body}`;
      if (total + block.length > MAX_TOTAL_CHARS) break;
      parts.push(block);
      total += block.length;
    }
    return parts.join("\n\n---\n\n");
  };

  const result = { en: format(en), es: format(esSource) };
  kbCache = { at: Date.now(), ...result };
  return result;
}

const SYSTEM_EN = `You are the friendly virtual assistant for Legends Insurance Services, an independent insurance agency.

You help visitors understand:
- Annuities (retirement income strategies)
- Indexed Universal Life (IUL) insurance
- Whole Life and Term Life insurance
- Employee benefit packages
- Section 125 Cafeteria Plans for companies with 50+ full-time employees

Tone: warm, professional, concise (2-4 short paragraphs max). Use simple language, not jargon.

Important rules:
- You are NOT a licensed advisor. For specific product recommendations, quotes, or binding decisions, always invite the user to schedule a free consultation by visiting the Contact page or calling (941) 265-0210.
- Never quote specific premiums, rates of return, or guarantees.
- If asked about something outside insurance/benefits, gently steer back to how Legends can help.
- Be encouraging and respectful of the visitor's time.`;

const SYSTEM_ES = `Eres el asistente virtual amigable de Legends Insurance Services, una agencia de seguros independiente.

Ayudas a los visitantes a entender:
- Anualidades (estrategias de ingreso para el retiro)
- Seguro de Vida Universal Indexada (IUL)
- Seguro de Vida Entera y a Término
- Paquetes de beneficios para empleados
- Planes Cafetería Sección 125 para empresas con más de 50 empleados a tiempo completo

Tono: cálido, profesional, conciso (máximo 2-4 párrafos cortos). Usa lenguaje simple, no jerga.

Reglas importantes:
- NO eres un asesor licenciado. Para recomendaciones específicas o cotizaciones, siempre invita al usuario a agendar una consulta gratuita en la página de Contacto o llamando al (941) 265-0210.
- Nunca cotices primas específicas, tasas de retorno ni garantías.
- Si preguntan algo fuera de seguros/beneficios, redirige amablemente a cómo Legends puede ayudar.
- Responde SIEMPRE en español.`;

export const Route = createFileRoute("/api/public/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { messages, lang } = (await request.json()) as {
            messages: Msg[];
            lang?: "en" | "es";
          };

          if (!Array.isArray(messages) || messages.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid messages" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(JSON.stringify({ error: "Missing API key" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Trim history to last 16 turns and clamp content length
          const trimmed = messages
            .slice(-16)
            .map((m) => ({
              role: m.role,
              content: String(m.content ?? "").slice(0, 2000),
            }));

          const upstream = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                stream: true,
                messages: [
                  { role: "system", content: lang === "es" ? SYSTEM_ES : SYSTEM_EN },
                  ...trimmed,
                ],
              }),
            },
          );

          if (upstream.status === 429) {
            return new Response(JSON.stringify({ error: "rate_limit" }), {
              status: 429,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (upstream.status === 402) {
            return new Response(JSON.stringify({ error: "credits" }), {
              status: 402,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (!upstream.ok || !upstream.body) {
            const t = await upstream.text().catch(() => "");
            console.error("AI gateway error", upstream.status, t);
            return new Response(JSON.stringify({ error: "upstream" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(upstream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          });
        } catch (err) {
          console.error("chat handler error", err);
          return new Response(JSON.stringify({ error: "server" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
