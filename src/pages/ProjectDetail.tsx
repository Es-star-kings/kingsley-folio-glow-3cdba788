import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, ArrowUpRight, CalendarDays, Github, Timer, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Seo } from "@/components/Seo";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/slug";

type ProjectRow = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  long_description: string | null;
  tech: string[];
  tags: string[];
  category: string | null;
  thumbnail: string | null;
  gallery: string[];
  video_url: string | null;
  github_url: string | null;
  demo_url: string | null;
  case_study: string | null;
  client_name: string | null;
  project_duration: string | null;
  completion_date: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

const ProjectDetail = () => {
  const { slug = "" } = useParams();
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .then(({ data }) => {
        const rows = (data as ProjectRow[]) ?? [];
        setProject(rows.find((p) => (p.slug || slugify(p.title)) === slug) ?? null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen py-24">
        <div className="container max-w-4xl space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-40 w-full" />
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <>
        <Seo path={`/projects/${slug}`} title="Project not found — Kingsley" description="This case study doesn't exist." noindex />
        <main className="min-h-screen grid place-items-center px-4 text-center">
          <div className="glass rounded-3xl p-10 max-w-md space-y-3">
            <h1 className="font-display text-2xl font-bold">Project not found</h1>
            <p className="text-muted-foreground text-sm">This case study may have been unpublished or moved.</p>
            <Link to="/#projects" className="text-primary hover:underline text-sm">← Back to projects</Link>
          </div>
        </main>
      </>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const path = `/projects/${project.slug || slugify(project.title)}`;
  const body = project.case_study?.trim() || project.long_description?.trim() || "";
  const meta = [
    project.client_name && { icon: User, label: "Client", value: project.client_name },
    project.project_duration && { icon: Timer, label: "Duration", value: project.project_duration },
    project.completion_date && {
      icon: CalendarDays,
      label: "Completed",
      value: new Date(project.completion_date).toLocaleDateString(undefined, { year: "numeric", month: "short" }),
    },
  ].filter(Boolean) as { icon: typeof User; label: string; value: string }[];

  return (
    <>
      <Seo
        path={path}
        title={project.seo_title?.trim() || `${project.title} — Case study | Kingsley`}
        description={
          project.seo_description?.trim() || project.description || `A case study of ${project.title} by Kingsley.`
        }
        image={project.thumbnail}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.description || "",
          image: project.thumbnail || undefined,
          keywords: [...(project.tech ?? []), ...(project.tags ?? [])].join(", "),
          author: { "@type": "Person", name: "Kingsley" },
          url: `${origin}${path}`,
        }}
      />

      <main className="min-h-screen py-20 sm:py-28 overflow-hidden">
        <article className="container max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
            <Link to="/#projects"><ArrowLeft className="h-4 w-4" /> All projects</Link>
          </Button>

          {project.category && (
            <div className="text-xs mono uppercase tracking-widest text-primary mb-3">{project.category}</div>
          )}
          <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">{project.title}</h1>
          {project.description && <p className="text-lg text-muted-foreground mt-4">{project.description}</p>}

          <div className="flex flex-wrap gap-3 mt-6">
            {project.demo_url && (
              <Button asChild variant="neon">
                <a href={project.demo_url} target="_blank" rel="noreferrer">
                  Live demo <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.github_url && (
              <Button asChild variant="outline">
                <a href={project.github_url} target="_blank" rel="noreferrer">
                  <Github className="h-4 w-4" /> Source
                </a>
              </Button>
            )}
          </div>

          {project.thumbnail && (
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={project.thumbnail}
              alt={`${project.title} cover`}
              loading="lazy"
              className="w-full rounded-3xl mt-10 object-cover max-h-[460px]"
            />
          )}

          {meta.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4 mt-10">
              {meta.map((m) => (
                <div key={m.label} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-xs mono uppercase tracking-widest text-muted-foreground">
                    <m.icon className="h-3.5 w-3.5" /> {m.label}
                  </div>
                  <div className="mt-1 font-medium">{m.value}</div>
                </div>
              ))}
            </div>
          )}

          {(project.tech ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {project.tech.map((t) => (
                <span key={t} className="text-xs mono px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}

          {body && (
            <div className="prose prose-invert max-w-none mt-10 prose-headings:font-display prose-a:text-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </div>
          )}

          {project.video_url && (
            <div className="mt-10 aspect-video rounded-3xl overflow-hidden glass">
              <iframe
                src={project.video_url}
                title={`${project.title} walkthrough`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {(project.gallery ?? []).length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4 mt-10">
              {project.gallery.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${project.title} screenshot ${i + 1}`}
                  loading="lazy"
                  className="w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          )}

          <div className="mt-14 pt-8 border-t border-border text-center">
            <Button asChild variant="neon" size="lg">
              <a href="/#contact">Start a project like this <ArrowUpRight className="h-4 w-4" /></a>
            </Button>
          </div>
        </article>
      </main>
    </>
  );
};

export default ProjectDetail;
