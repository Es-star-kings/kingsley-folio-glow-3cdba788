import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export type PublicPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  category: string | null;
  tags: string[];
  reading_time: number | null;
  published_at: string | null;
  created_at: string;
};

export const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

const Blog = () => {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState<string>("All");

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,featured_image,category,tags,reading_time,published_at,created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as PublicPost[]) ?? []);
        setLoading(false);
      });
  }, []);

  const tags = ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags ?? [])))];
  const visible = tag === "All" ? posts : posts.filter((p) => (p.tags ?? []).includes(tag));

  return (
    <>
      <Seo
        path="/blog"
        title="Blog — Kingsley"
        description="Articles on frontend development, React, performance and design engineering."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Kingsley — Blog",
          blogPost: posts.slice(0, 20).map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.published_at ?? p.created_at,
            url: `${typeof window !== "undefined" ? window.location.origin : ""}/blog/${p.slug}`,
          })),
        }}
      />

      <main className="min-h-screen py-20 sm:py-28">
        <div className="container max-w-5xl">
          <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Back to site</Link>
          </Button>

          <header className="mb-10">
            <div className="text-xs mono uppercase tracking-widest text-primary mb-3">Writing</div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-gradient">The Blog</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Notes on frontend engineering, React, performance and building polished interfaces.
            </p>
          </header>

          {tags.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-3 py-1.5 rounded-full text-xs mono border transition-all ${
                    tag === t
                      ? "bg-gradient-primary text-primary-foreground border-transparent"
                      : "glass border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 gap-6">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}
            </div>
          ) : visible.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
              No posts published yet — check back soon.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {visible.map((p, i) => (
                <motion.article
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="glass rounded-3xl overflow-hidden hover:shadow-neon transition-all"
                >
                  <Link to={`/blog/${p.slug}`} className="block h-full">
                    {p.featured_image ? (
                      <img
                        src={p.featured_image}
                        alt={`${p.title} cover image`}
                        loading="lazy"
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="h-44 w-full bg-gradient-primary/20" aria-hidden />
                    )}
                    <div className="p-6 space-y-3">
                      {p.category && (
                        <div className="text-xs mono uppercase tracking-widest text-primary">{p.category}</div>
                      )}
                      <h2 className="font-display text-xl font-semibold leading-snug">{p.title}</h2>
                      {p.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mono pt-1">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" /> {formatDate(p.published_at ?? p.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {p.reading_time ?? 1} min read
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Blog;
