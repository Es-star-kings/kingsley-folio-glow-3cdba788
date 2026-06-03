import { motion } from "framer-motion";
import { skills } from "@/data/portfolio";
import { SectionHeading } from "./SectionHeading";

export const Skills = () => {
  return (
    <section id="skills" className="py-24 sm:py-32 relative">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="container">
        <SectionHeading
          eyebrow="Skills"
          title="My technical toolkit"
          description="The tools I reach for every day to ship polished, performant interfaces."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group glass rounded-2xl p-6 hover:shadow-neon transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-display text-lg font-semibold">{s.name}</div>
                  <div className="text-xs mono text-muted-foreground uppercase tracking-wider">{s.category}</div>
                </div>
                <div className="font-display text-2xl font-bold text-gradient">{s.level}%</div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                  className="h-full bg-gradient-primary rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
