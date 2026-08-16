import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();

const metaOf = (html: string, keys: string[]) => {
  for (const key of keys) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`,
      "i",
    );
    const re2 = new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`,
      "i",
    );
    const m = html.match(re) ?? html.match(re2);
    if (m?.[1]) return decode(m[1]);
  }
  return "";
};

const abs = (url: string, base: string) => {
  if (!url) return "";
  try {
    return new URL(url, base).toString();
  } catch {
    return "";
  }
};

const TECH_HINTS: Record<string, RegExp> = {
  React: /react(\.|-)|__REACT|data-reactroot|_next\/static/i,
  "Next.js": /_next\/static|__NEXT_DATA__/i,
  Vue: /vue(\.|-)runtime|data-v-app/i,
  Svelte: /svelte/i,
  Angular: /ng-version|angular/i,
  "Tailwind CSS": /tailwind/i,
  Bootstrap: /bootstrap(\.min)?\.css/i,
  WordPress: /wp-content|wp-includes/i,
  Shopify: /cdn\.shopify\.com/i,
  Webflow: /webflow/i,
  Vite: /\/assets\/index-[\w]+\.js/i,
  TypeScript: /\.tsx?["']/i,
  "Framer Motion": /framer-motion/i,
  Supabase: /supabase/i,
  Firebase: /firebase/i,
  Stripe: /js\.stripe\.com/i,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { url } = await req.json().catch(() => ({}));
    if (typeof url !== "string" || !/^https?:\/\/.+/i.test(url.trim())) {
      return json({ error: "A valid http(s) URL is required" }, 400);
    }
    const target = url.trim();

    let html = "";
    try {
      const res = await fetch(target, {
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; PortfolioBot/1.0; +https://lovable.dev)",
          Accept: "text/html,application/xhtml+xml",
        },
      });
      if (!res.ok) return json({ error: `Site returned ${res.status}` }, 400);
      html = await res.text();
    } catch (_e) {
      return json({ error: "Could not reach that URL" }, 400);
    }

    const finalBase = target;
    const title =
      metaOf(html, ["og:title", "twitter:title", "application-name"]) ||
      decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const description = metaOf(html, [
      "og:description",
      "twitter:description",
      "description",
    ]);
    const siteName = metaOf(html, ["og:site_name"]);
    const rawImage = metaOf(html, ["og:image:secure_url", "og:image", "twitter:image"]);
    const image = abs(rawImage, finalBase);

    // Gallery: og:image variants + large images in the page
    const gallery = new Set<string>();
    if (image) gallery.add(image);
    for (const m of html.matchAll(
      /<meta[^>]+(?:property|name)=["'](?:og:image(?::url)?|twitter:image(?::src)?)["'][^>]*content=["']([^"']+)["']/gi,
    )) {
      const u = abs(decode(m[1]), finalBase);
      if (u) gallery.add(u);
    }
    for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
      if (gallery.size >= 6) break;
      const u = abs(decode(m[1]), finalBase);
      if (u && !/\.svg($|\?)/i.test(u) && !/(logo|icon|avatar|sprite)/i.test(u)) {
        gallery.add(u);
      }
    }

    const tech = Object.entries(TECH_HINTS)
      .filter(([, re]) => re.test(html))
      .map(([name]) => name);

    const keywords = metaOf(html, ["keywords"])
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);

    let host = "";
    try {
      host = new URL(finalBase).hostname.replace(/^www\./, "");
    } catch { /* ignore */ }

    let longDescription = "";
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (key && (title || description)) {
      try {
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 6000);

        const ai = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You write portfolio case-study copy for a frontend developer. Reply ONLY with strict JSON: {\"description\": string (max 160 chars, one punchy sentence), \"longDescription\": string (2 short markdown paragraphs about what the product does and the frontend work involved), \"category\": string (2 words max), \"tech\": string[] (max 8 likely technologies)}. No markdown fences.",
              },
              {
                role: "user",
                content: `URL: ${finalBase}\nTitle: ${title}\nMeta description: ${description}\nDetected tech: ${tech.join(", ")}\nPage text: ${text}`,
              },
            ],
          }),
        });
        if (ai.ok) {
          const data = await ai.json();
          const raw = (data?.choices?.[0]?.message?.content ?? "")
            .replace(/```json|```/g, "")
            .trim();
          const parsed = JSON.parse(raw);
          if (parsed?.longDescription) longDescription = String(parsed.longDescription);
          if (parsed?.description) {
            // prefer AI copy when the site's meta description is missing/weak
            if (!description || description.length < 40) {
              (parsed as Record<string, unknown>).__useDesc = true;
            }
          }
          return json({
            title: title || host,
            description:
              !description || description.length < 40
                ? String(parsed.description ?? description ?? "")
                : description,
            longDescription,
            category: String(parsed.category ?? ""),
            tech: Array.from(
              new Set([...(Array.isArray(parsed.tech) ? parsed.tech.map(String) : []), ...tech]),
            ).slice(0, 10),
            tags: keywords,
            thumbnail: image,
            gallery: Array.from(gallery).slice(0, 6),
            demoUrl: finalBase,
            siteName: siteName || host,
          });
        }
      } catch (_e) {
        // fall through to metadata-only result
      }
    }

    return json({
      title: title || host,
      description,
      longDescription,
      category: "",
      tech,
      tags: keywords,
      thumbnail: image,
      gallery: Array.from(gallery).slice(0, 6),
      demoUrl: finalBase,
      siteName: siteName || host,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
