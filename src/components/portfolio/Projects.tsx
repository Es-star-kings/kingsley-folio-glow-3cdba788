import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Github, Star } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { SectionHeading } from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Projects = () => {
  const { projects } = usePortfolio();
  const [filter, setFilter] = useState<string>("All");


  const techs = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tech.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set)];
  }, [projects]);

  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.tech.includes(filter))),
    [filter, projects]
  );

  if (!projects.length) return null;

  return (
    <section id="projects" className="py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="container">
        <SectionHeading
          eyebrow="Projects"
          title="Selected recent work"
          description="A snapshot of products and interfaces I've designed and built."
        />

        <div className="flex flex-wrap gap-2 mb-10">
          {techs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-4 py-2 rounded-full text-sm mono transition-all border",
                filter === t
                  ? "bg-gradient-primary text-primary-foreground border-transparent shadow-neon"
                  : "glass border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.article
                key={p.title}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className={cn(
                  "group glass rounded-3xl overflow-hidden hover:shadow-elegant transition-all",
                  p.featured && "md:col-span-2"
                )}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    width={1280}
                    height={800}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  {p.featured && (
                    <div className="absolute top-4 left-4 glass rounded-full px-3 py-1 text-xs mono flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-primary fill-primary" /> Featured
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl font-bold">{p.title}</h3>
                    <div className="flex gap-2">
                      <a
                        href={p.github}
                        aria-label="GitHub"
                        className="h-9 w-9 rounded-full glass grid place-items-center hover:text-primary hover:shadow-neon transition-all"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                      <a
                        href={p.demo}
                        aria-label="Live demo"
                        className="h-9 w-9 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground hover:scale-110 transition-transform"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{p.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {p.tech.map((t) => (
                      <span key={t} className="text-xs mono px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="neon" size="lg">
            <a href="#contact">Have a project in mind? <ArrowUpRight className="h-4 w-4" /></a>
          </Button>
        </div>
      </div>
    </section>
  );
};
