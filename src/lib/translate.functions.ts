import { createServerFn } from "@tanstack/react-start";

export const translateBlogToSpanish = createServerFn({ method: "POST" })
  .inputValidator((data: { title: string; summary: string; body: string }) => data)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing AI API key");

    const system = `You are a professional translator. Translate English blog content into natural, fluent Spanish (neutral Latin American Spanish).
Rules:
- Preserve HTML structure EXACTLY: every tag, attribute, class, data-* attribute, style, and whitespace between tags must remain identical. Translate only the visible text content inside tags.
- Do not translate URLs, code, brand names, or proper nouns like "Legends Insurance Services".
- Return ONLY a single valid JSON object, no markdown fences, with keys: title, summary, body.`;

    const user = JSON.stringify({
      title: data.title || "",
      summary: data.summary || "",
      body: data.body || "",
    });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Translate the values in this JSON to Spanish and return the same shape:\n${user}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("translate upstream error", res.status, t);
      throw new Error("Translation failed");
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed: { title?: string; summary?: string; body?: string };
    try {
      parsed = JSON.parse(content);
    } catch {
      // Strip code fences if present
      const stripped = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      parsed = JSON.parse(stripped);
    }
    return {
      title: String(parsed.title ?? ""),
      summary: String(parsed.summary ?? ""),
      body: String(parsed.body ?? ""),
    };
  });
