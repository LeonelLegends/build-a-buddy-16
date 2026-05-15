import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_EN = `You are the friendly virtual assistant for Legends Insurance Services, an independent insurance agency.

You help visitors understand:
- Annuities (retirement income strategies)
- Indexed Universal Life (IUL) insurance
- Whole Life and Term Life insurance
- Employee benefit packages
- Section 125 Cafeteria Plans for companies with 50+ full-time employees

Tone: warm, professional, concise (2-4 short paragraphs max). Use simple language, not jargon.

Important rules:
- You are NOT a licensed advisor. For specific product recommendations, quotes, or binding decisions, always invite the user to schedule a free consultation by visiting the Contact page or calling (555) 123-4567.
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
- NO eres un asesor licenciado. Para recomendaciones específicas o cotizaciones, siempre invita al usuario a agendar una consulta gratuita en la página de Contacto o llamando al (555) 123-4567.
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
