// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Pulls published blog posts and admin-managed SEO pages from the database when reachable,
// and always falls back to the known static routes.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { readFileSync, existsSync } from "fs";

const BASE_URL = "https://kingsley-folio-glow.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const readEnv = () => {
  const out: Record<string, string> = {};
  const file = resolve(".env");
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
};

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
];

async function fetchDynamic(): Promise<SitemapEntry[]> {
  const env = { ...readEnv(), ...process.env } as Record<string, string>;
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];

  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const entries: SitemapEntry[] = [];

  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=slug,updated_at,published_at&status=eq.published`,
      { headers },
    );
    if (res.ok) {
      for (const p of (await res.json()) as any[]) {
        entries.push({
          path: `/blog/${p.slug}`,
          lastmod: (p.updated_at ?? p.published_at ?? "").slice(0, 10) || undefined,
          changefreq: "monthly",
          priority: "0.6",
        });
      }
    }
  } catch {
    /* offline build — static entries only */
  }

  try {
    const res = await fetch(`${url}/rest/v1/seo_pages?select=path,changefreq,priority,noindex`, { headers });
    if (res.ok) {
      for (const s of (await res.json()) as any[]) {
        if (s.noindex) continue;
        const existing = entries.find((e) => e.path === s.path) ?? staticEntries.find((e) => e.path === s.path);
        if (existing) {
          existing.changefreq = s.changefreq ?? existing.changefreq;
          existing.priority = s.priority ?? existing.priority;
        } else {
          entries.push({ path: s.path, changefreq: s.changefreq, priority: s.priority });
        }
      }
    }
  } catch {
    /* ignore */
  }

  return entries;
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const dynamic = await fetchDynamic();
const seen = new Set<string>();
const entries = [...staticEntries, ...dynamic].filter((e) => (seen.has(e.path) ? false : seen.add(e.path)));

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
