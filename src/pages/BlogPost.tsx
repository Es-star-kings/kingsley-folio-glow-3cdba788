import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "./Blog";
import { PostReactions } from "@/components/blog/PostReactions";
import { PostComments } from "@/components/blog/PostComments";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: string | null;
  tags: string[];
  reading_time: number | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const BlogPost = () => {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        setPost((data as Post) ?? null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen py-24">
        <div className="container max-w-3xl space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <>
        <Seo path={`/blog/${slug}`} title="Post not found — Kingsley" description="This article doesn't exist." noindex />
        <main className="min-h-screen grid place-items-center px-4 text-center">
          <div className="glass rounded-3xl p-10 max-w-md space-y-3">
            <h1 className="font-display text-2xl font-bold">Post not found</h1>
            <p className="text-muted-foreground text-sm">This article may have been unpublished or moved.</p>
            <Link to="/blog" className="text-primary hover:underline text-sm">← Back to blog</Link>
          </div>
        </main>
      </>
    );
  }

  const published = post.published_at ?? post.created_at;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <>
      <Seo
        path={`/blog/${post.slug}`}
        title={post.seo_title?.trim() || `${post.title} — Kingsley`}
        description={post.seo_description?.trim() || post.excerpt || "Article by Kingsley, frontend developer."}
        image={post.featured_image}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.seo_description || post.excerpt || "",
          image: post.featured_image || undefined,
          datePublished: published,
          dateModified: post.updated_at,
          author: { "@type": "Person", name: "Kingsley" },
          mainEntityOfPage: `${origin}/blog/${post.slug}`,
          keywords: (post.tags ?? []).join(", "),
        }}
      />

      <main className="min-h-screen py-20 sm:py-28">
        <article className="container max-w-3xl">
          <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
            <Link to="/blog"><ArrowLeft className="h-4 w-4" /> All posts</Link>
          </Button>

          {post.category && (
            <div className="text-xs mono uppercase tracking-widest text-primary mb-3">{post.category}</div>
          )}
          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mono mt-4">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> {formatDate(published)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {post.reading_time ?? 1} min read
            </span>
          </div>

          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={`${post.title} cover image`}
              className="w-full rounded-3xl mt-8 object-cover max-h-[420px]"
            />
          )}

          {post.excerpt && <p className="text-lg text-muted-foreground mt-8">{post.excerpt}</p>}

          <div className="prose prose-invert max-w-none mt-8 prose-headings:font-display prose-a:text-primary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content ?? ""}</ReactMarkdown>
          </div>

          {(post.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
              {post.tags.map((t) => (
                <span key={t} className="px-3 py-1 rounded-full text-xs mono glass border border-border text-muted-foreground">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-border">
            <PostReactions postId={post.id} />
          </div>

          <div className="mt-12">
            <PostComments postId={post.id} />
          </div>
        </article>
      </main>
    </>
  );
};

export default BlogPost;
