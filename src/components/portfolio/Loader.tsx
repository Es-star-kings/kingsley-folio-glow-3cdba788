import { motion } from "framer-motion";

export const Loader = () => (
  <motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ delay: 0.9, duration: 0.5 }}
    onAnimationComplete={(d: any) => {
      if (d.opacity === 0) {
        const el = document.getElementById("app-loader");
        if (el) el.style.display = "none";
      }
    }}
    id="app-loader"
    className="fixed inset-0 z-[100] grid place-items-center bg-background"
  >
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-50 rounded-full" />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        className="relative h-16 w-16 rounded-2xl border-2 border-transparent border-t-primary border-r-secondary"
      />
      <div className="mt-6 text-center font-display font-semibold text-gradient">
        Kingsley<span className="text-foreground/40">.dev</span>
      </div>
    </div>
  </motion.div>
);
