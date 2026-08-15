import { motion } from "framer-motion";
import { Code2, Sparkles, Users } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { SectionHeading } from "./SectionHeading";

export const About = () => {
  const { about, personal } = usePortfolio();
  const stats = [
    { icon: Code2, label: "Years coding", value: personal.yearsExperience },
    { icon: Sparkles, label: "Projects shipped", value: personal.projectsShipped },
    { icon: Users, label: "Happy clients", value: personal.happyClients },
  ].filter((s) => s.value > 0);
  return (
    <section id="about" className="py-16 sm:py-24 lg:py-32">
      <div className="container">
        <SectionHeading eyebrow="About" title="A bit about me" />

        <div className={stats.length ? "grid lg:grid-cols-2 gap-12 items-start" : "grid gap-12 items-start"}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <p className="text-lg leading-relaxed text-muted-foreground">{about.summary}</p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {about.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-primary shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass rounded-2xl p-6 hover:shadow-neon transition-all group"
              >
                <s.icon className="h-6 w-6 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <div className="font-display text-3xl font-bold text-gradient">{s.value}+</div>
                <div className="text-xs mono text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </div>
    </section>
  );
};
