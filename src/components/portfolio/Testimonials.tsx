import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { usePortfolio } from "@/context/PortfolioContext";
import { SectionHeading } from "./SectionHeading";

export const Testimonials = () => {
  const { testimonials } = usePortfolio();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!testimonials.length) return;
    const t = setInterval(() => setI((p) => (p + 1) % testimonials.length), 6000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  if (!testimonials.length) return null;

  const t = testimonials[i];

  return (
    <section id="testimonials" className="py-24 sm:py-32 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 grid-pattern opacity-30" />
      <div className="container">
        <SectionHeading
          eyebrow="Testimonials"
          title="Kind words from clients"
          center
        />

        <div className="max-w-3xl mx-auto relative">
          <div className="relative glass rounded-3xl p-8 sm:p-12 min-h-[260px] flex items-center">
            <Quote className="absolute top-6 left-6 h-10 w-10 text-primary/30" />
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="w-full text-center space-y-6"
              >
                <p className="text-lg sm:text-xl leading-relaxed font-display">"{t.quote}"</p>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-muted-foreground mono">{t.role}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setI((p) => (p - 1 + testimonials.length) % testimonials.length)}
              className="h-10 w-10 rounded-full glass grid place-items-center hover:text-primary hover:shadow-neon transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Go to ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === i ? "w-8 bg-gradient-primary" : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setI((p) => (p + 1) % testimonials.length)}
              className="h-10 w-10 rounded-full glass grid place-items-center hover:text-primary hover:shadow-neon transition-all"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
