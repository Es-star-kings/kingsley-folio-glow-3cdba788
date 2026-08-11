import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

export type SeoPage = {
  id?: string;
  path: string;
  label?: string;
  title: string;
  description: string;
  keywords?: string;
  og_image?: string | null;
  noindex?: boolean;
  changefreq?: string;
  priority?: string;
};

// seo_pages is managed via the admin; typed loosely until generated types catch up.
const seoTable = () => (supabase as any).from("seo_pages");

/** Fetch the stored SEO record for a route (returns null when none is configured). */
export const useSeoPage = (path: string) => {
  const [page, setPage] = useState<SeoPage | null>(null);

  useEffect(() => {
    let cancelled = false;
    seoTable()
      .select("*")
      .eq("path", path)
      .maybeSingle()
      .then(({ data }: { data: SeoPage | null }) => {
        if (!cancelled) setPage(data ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return page;
};

type Props = {
  /** Route path used to look up admin-managed overrides, e.g. "/" or "/blog" */
  path: string;
  /** Fallbacks used when nothing is configured in the admin */
  title: string;
  description: string;
  image?: string | null;
  type?: "website" | "article";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export const Seo = ({ path, title, description, image, type = "website", noindex, jsonLd }: Props) => {
  const managed = useSeoPage(path);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const finalTitle = managed?.title?.trim() || title;
  const finalDesc = managed?.description?.trim() || description;
  const finalImage = managed?.og_image?.trim() || image || "";
  const finalNoindex = managed?.noindex ?? noindex ?? false;
  const url = `${origin}${path}`;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      {managed?.keywords ? <meta name="keywords" content={managed.keywords} /> : null}
      <link rel="canonical" href={url} />
      <meta name="robots" content={finalNoindex ? "noindex, nofollow" : "index, follow"} />

      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      {finalImage ? <meta property="og:image" content={finalImage} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      {finalImage ? <meta name="twitter:image" content={finalImage} /> : null}

      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
    </Helmet>
  );
};
