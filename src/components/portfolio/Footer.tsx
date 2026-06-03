import { Heart } from "lucide-react";
import { navLinks, socialLinksFor } from "@/data/portfolio";
import { usePortfolio } from "@/context/PortfolioContext";

export const Footer = () => {
  const { personal } = usePortfolio();
  const socialLinks = socialLinksFor(personal);
  return (
    <footer className="border-t border-border pt-16 pb-8 mt-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div className="space-y-4">
            <a href="#home" className="inline-flex items-center gap-2">
              <span className="h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center font-display font-bold text-primary-foreground shadow-neon">
                K
              </span>
              <span className="font-display text-xl font-semibold">
                {personal.name}<span className="text-primary">.</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground max-w-xs">
              Frontend developer crafting fast, beautiful web experiences from {personal.location}.
            </p>
          </div>

          <div>
            <div className="text-xs mono uppercase tracking-wider text-muted-foreground mb-4">Navigate</div>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs mono uppercase tracking-wider text-muted-foreground mb-4">Find me online</div>
            <div className="flex gap-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="h-10 w-10 rounded-full glass grid place-items-center text-muted-foreground hover:text-primary hover:shadow-neon transition-all"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border text-xs mono text-muted-foreground">
          <div>© {new Date().getFullYear()} {personal.fullName}. All rights reserved.</div>
          <div className="flex items-center gap-1.5">
            Built with <Heart className="h-3 w-3 text-primary fill-primary" /> and React.
          </div>
        </div>
      </div>
    </footer>
  );
};
