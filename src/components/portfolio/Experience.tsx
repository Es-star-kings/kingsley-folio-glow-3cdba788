import { motion } from "framer-motion";
import { usePortfolio } from "@/context/PortfolioContext";
import { SectionHeading } from "./SectionHeading";

export const Experience = () => {
  const { experience } = usePortfolio();
  return (
    <section id="experience" className="py-24 sm:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Experience"
          title="My professional journey"
          description="A short timeline of the teams I've built with."
        />

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-4 sm:left-1/2 sm:-translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-secondary/40 to-transparent" />

          {experience.map((e, i) => (
            <motion.div
              key={e.role}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className={`relative mb-10 sm:mb-14 sm:w-1/2 ${
                i % 2 === 0 ? "sm:pr-10" : "sm:ml-auto sm:pl-10"
              } pl-12 sm:pl-0`}
            >
              <div
                className={`absolute top-3 h-4 w-4 rounded-full bg-gradient-primary shadow-neon left-2 sm:left-auto ${
                  i % 2 === 0 ? "sm:-right-2" : "sm:-left-2"
                }`}
              />
              <div className="glass rounded-2xl p-6 hover:shadow-elegant transition-all">
                <div className="text-xs mono text-primary uppercase tracking-wider mb-2">{e.period}</div>
                <h3 className="font-display text-xl font-semibold">{e.role}</h3>
                <div className="text-sm text-muted-foreground mb-3">{e.company}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{e.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
