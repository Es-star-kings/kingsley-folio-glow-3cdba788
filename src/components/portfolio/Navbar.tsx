import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, X, Moon, Sun, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navLinks, personal } from "@/data/portfolio";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);

  return (
    <>
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-primary origin-left z-[60]"
      />
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <div className="container">
          <nav
            className={cn(
              "flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500",
              scrolled ? "glass shadow-elegant" : ""
            )}
          >
            <a href="#home" className="flex items-center gap-2 group">
              <span className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground shadow-neon">
                K
              </span>
              <span className="font-display font-semibold tracking-tight hidden sm:inline">
                {personal.name}<span className="text-primary">.</span>
              </span>
            </a>

            <ul className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                  >
                    {l.label}
                    <span className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 group-hover:scale-x-100 origin-left transition-transform bg-gradient-primary" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDark(!dark)}
                aria-label="Toggle theme"
                className="rounded-full"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button asChild variant="neon" size="sm" className="hidden sm:inline-flex">
                <a href={personal.cvUrl} download>
                  <Download className="h-4 w-4" /> CV
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setOpen(!open)}
                aria-label="Menu"
              >
                {open ? <X /> : <Menu />}
              </Button>
            </div>
          </nav>

          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-2 glass rounded-2xl p-4"
            >
              <ul className="flex flex-col gap-1">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a
                      onClick={() => setOpen(false)}
                      href={l.href}
                      className="block px-4 py-3 rounded-lg hover:bg-muted text-sm"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </header>
    </>
  );
};
