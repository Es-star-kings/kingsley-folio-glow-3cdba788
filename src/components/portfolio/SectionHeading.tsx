import { motion } from "framer-motion";

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}

export const SectionHeading = ({ eyebrow, title, description, center }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6 }}
    className={`mb-12 sm:mb-16 max-w-2xl ${center ? "mx-auto text-center" : ""}`}
  >
    <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs mono mb-4">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {eyebrow}
    </div>
    <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
      {title.split(" ").map((w, i, arr) =>
        i === arr.length - 1 ? (
          <span key={i} className="text-gradient">{w}</span>
        ) : (
          <span key={i}>{w} </span>
        )
      )}
    </h2>
    {description && <p className="mt-4 text-muted-foreground">{description}</p>}
  </motion.div>
);
