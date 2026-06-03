import { motion } from "framer-motion";
import { Code2, Gauge, LayoutDashboard, Paintbrush, Plug, Rocket } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { SectionHeading } from "./SectionHeading";

const icons = { Code2, Rocket, LayoutDashboard, Gauge, Plug, Paintbrush } as const;

export const Services = () => {
  const { services } = usePortfolio();
  return (
    <section id="services" className="py-24 sm:py-32 relative">
      <div aria-hidden className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[60rem] bg-primary/10 blur-3xl rounded-full" />
      <div className="container">
        <SectionHeading
          eyebrow="Services"
          title="How I can help you"
          description="From a single landing page to a full product frontend — I plug in where I'm most useful."
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const Icon = icons[s.icon as keyof typeof icons];
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="group relative glass rounded-3xl p-7 hover:shadow-elegant transition-all overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 h-32 w-32 bg-gradient-primary rounded-full opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500" />
                <div className="relative h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center text-primary-foreground shadow-neon mb-5">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                <div className="mt-6 text-xs mono text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  → Get in touch
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
