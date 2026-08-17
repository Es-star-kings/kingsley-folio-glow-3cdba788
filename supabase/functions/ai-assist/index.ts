import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BLOG_SYSTEM = `You are an expert technical blog writer for a senior frontend developer's portfolio.
Write original, practical, engaging posts with concrete examples and code snippets where useful.
Return ONLY valid JSON (no markdown fences) with exactly these keys:
{
  "title": string (max 70 chars),
  "slug": string (lowercase-hyphenated),
  "excerpt": string (max 200 chars),
  "content": string (full post in GitHub-flavoured markdown, using ## headings, lists and code blocks; do NOT repeat the title as an H1),
  "category": string,
  "tags": string[] (3-6 items),
  "seo_title": string (max 60 chars),
  "seo_description": string (max 155 chars)
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const mode: string = body?.mode === "blog" ? "blog" : "text";
    const prompt: unknown = body?.prompt;
    if (typeof prompt !== "string" || !prompt.trim()) {
      return json({ error: "prompt required" }, 400);
    }
    if (prompt.length > 8000) return json({ error: "prompt too long" }, 400);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI not configured" }, 500);

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: mode === "blog" ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
        ...(mode === "blog" ? { response_format: { type: "json_object" } } : {}),
        messages: [
          {
            role: "system",
            content:
              mode === "blog"
                ? BLOG_SYSTEM
                : "You are a helpful writing assistant for a premium developer portfolio CMS. Write in a confident, modern, and concise tone. Return clean, ready-to-paste copy in markdown when useful, no preamble.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      if (resp.status === 429) return json({ error: "Rate limited — try again in a moment." }, 429);
      if (resp.status === 402)
        return json({ error: "AI credits exhausted. Add credits in Lovable workspace billing." }, 402);
      return json({ error: `AI gateway error: ${text}` }, resp.status);
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    if (mode === "blog") {
      const cleaned = String(text).replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      try {
        const post = JSON.parse(cleaned);
        return json({ post });
      } catch {
        return json({ error: "AI returned an unexpected format. Try again." }, 502);
      }
    }

    return json({ text });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
