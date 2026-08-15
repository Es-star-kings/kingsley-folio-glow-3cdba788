import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Code2, Gauge, LayoutDashboard, Paintbrush, Plug, Rocket } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { SectionHeading } from "./SectionHeading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { requestService } from "@/lib/contact-prefill";

const icons = { Code2, Rocket, LayoutDashboard, Gauge, Plug, Paintbrush } as const;

const deliverables = [
  "Discovery call & clear written scope",
  "Responsive, accessible implementation",
  "Performance & SEO pass before handover",
  "Clean, documented code you own",
];

export const Services = () => {
  const { services } = usePortfolio();
  const [active, setActive] = useState<number | null>(null);
  if (!services.length) return null;

  const current = active !== null ? services[active] : null;

  return (
    <section id="services" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      <div aria-hidden className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-full max-w-[60rem] bg-primary/10 blur-3xl rounded-full" />
      <div className="container">
        <SectionHeading
          eyebrow="Services"
          title="How I can help you"
          description="From a single landing page to a full product frontend — I plug in where I'm most useful."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {services.map((s, i) => {
            const Icon = icons[s.icon as keyof typeof icons] ?? Code2;
            return (
              <motion.button
                type="button"
                key={s.title}
                onClick={() => setActive(i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="group relative text-left glass rounded-3xl p-6 sm:p-7 hover:shadow-elegant transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="absolute -top-12 -right-12 h-32 w-32 bg-gradient-primary rounded-full opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500" />
                <div className="relative h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-neon mb-5">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                <div className="mt-5 sm:mt-6 inline-flex items-center gap-1.5 text-xs mono text-primary">
                  View details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="glass max-w-lg">
          {current && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{current.title}</DialogTitle>
                <DialogDescription className="leading-relaxed">{current.description}</DialogDescription>
              </DialogHeader>
              <ul className="space-y-2.5 my-2">
                {deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{d}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => {
                  setActive(null);
                  requestService(current.title);
                }}
              >
                Request this service <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
