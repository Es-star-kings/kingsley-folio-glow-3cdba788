import { motion } from "framer-motion";
import { ArrowRight, Briefcase, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortfolio } from "@/context/PortfolioContext";
import { socialLinksFor } from "@/data/portfolio";

export const Hero = () => {
  const { personal } = usePortfolio();
  const socials = socialLinksFor(personal);
  return (
    <section id="home" className="relative lg:min-h-screen flex items-center pt-28 pb-14 sm:pb-16 overflow-hidden">
      {/* Animated background blobs */}
      <div aria-hidden className="absolute inset-0 -z-10 grid-pattern" />
      <div aria-hidden className="absolute -z-10 top-20 -left-20 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl animate-blob" />
      <div aria-hidden className="absolute -z-10 bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-secondary/25 blur-3xl animate-blob" style={{ animationDelay: "-8s" }} />

      <div className="container grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6 sm:space-y-8"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs mono">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Available for new projects
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] break-words">
            Hi, I'm <span className="text-gradient">{personal.name}</span>
            <br />
            <span className="text-foreground/90">{personal.title}.</span>
          </h1>

          <p className="text-base sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
            {personal.tagline} Based in {personal.location} — working with teams worldwide.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <a href="#projects">
                View Projects <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="neon" size="lg">
              <a href="#contact">
                <Briefcase className="h-4 w-4" /> Hire Me
              </a>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="h-10 w-10 rounded-full glass grid place-items-center text-muted-foreground hover:text-primary hover:shadow-neon transition-all"
                  aria-label={s.label}
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <div className="hidden sm:block h-8 w-px bg-border" />
            <div className="flex items-center gap-5 sm:gap-6 text-sm">
              {[
                { v: personal.yearsExperience, l: "years" },
                { v: personal.projectsShipped, l: "projects" },
                { v: personal.happyClients, l: "clients" },
              ]
                .filter((s) => s.v > 0)
                .map((s) => (
                  <div key={s.l}>
                    <div className="font-display text-xl sm:text-2xl font-bold text-gradient">{s.v}+</div>
                    <div className="text-xs text-muted-foreground mono">{s.l}</div>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-6 bg-gradient-primary opacity-30 blur-3xl rounded-full" aria-hidden />
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden neon-border glass animate-float">
            {personal.avatar ? (
              <img
                src={personal.avatar}
                alt={`${personal.fullName}, ${personal.title}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center bg-gradient-primary/10">
                <span className="font-display text-7xl font-bold text-gradient">
                  {(personal.name || "K").charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 glass rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs mono text-muted-foreground">CURRENTLY</div>
                <div className="font-display font-semibold">Building cool stuff</div>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </div>
          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -left-6 top-10 glass rounded-2xl px-4 py-3 shadow-elegant hidden sm:block"
          >
            <div className="text-xs mono text-muted-foreground">REACT · TS</div>
            <div className="font-display font-semibold">Senior Engineer</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -right-4 bottom-24 glass rounded-2xl px-4 py-3 shadow-elegant hidden sm:block"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium">Open to work</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
