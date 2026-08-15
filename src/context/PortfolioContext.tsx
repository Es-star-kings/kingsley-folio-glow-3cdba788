import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { defaultPortfolio, PortfolioData } from "@/data/portfolio";
import { supabase } from "@/integrations/supabase/client";

type Ctx = PortfolioData & {
  loading: boolean;
  refresh: () => Promise<void>;
  // legacy no-ops kept so any older callers don't crash
  update: (patch: Partial<PortfolioData>) => void;
  replace: (data: PortfolioData) => void;
  reset: () => void;
  exportJSON: () => string;
  importJSON: (raw: string) => boolean;
};

const PortfolioContext = createContext<Ctx | null>(null);

const mergeDefaults = (partial: Partial<PortfolioData>): PortfolioData => ({
  ...defaultPortfolio,
  ...partial,
  personal: { ...defaultPortfolio.personal, ...(partial.personal || {}) },
  about: { ...defaultPortfolio.about, ...(partial.about || {}) },
});

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<PortfolioData>(defaultPortfolio);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, projectsRes, skillsRes, expRes, servicesRes, testiRes] = await Promise.all([
        supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("projects").select("*").eq("status", "published").order("sort_order").order("created_at"),
        supabase.from("skills").select("*").order("sort_order").order("created_at"),
        supabase.from("experiences").select("*").order("sort_order").order("created_at"),
        supabase.from("services").select("*").order("sort_order").order("created_at"),
        supabase.from("testimonials").select("*").eq("approved", true).order("sort_order").order("created_at"),
      ]);

      const s = settingsRes.data;
      const personal = { ...defaultPortfolio.personal, ...(s?.personal as object | null || {}) };
      const about = { ...defaultPortfolio.about, ...(s?.about as object | null || {}) };

      const projects = (projectsRes.data ?? []).map((p) => ({
        title: p.title,
        description: p.description ?? "",
        image: p.thumbnail ?? "",
        tech: p.tech ?? [],
        demo: p.demo_url ?? "#",
        github: p.github_url ?? "#",
        featured: p.featured,
      }));

      const skills = (skillsRes.data ?? []).map((s) => ({
        name: s.name,
        level: s.level,
        category: s.category ?? "",
      }));

      const experience = (expRes.data ?? []).map((e) => ({
        role: e.role,
        company: e.company,
        period: e.period ?? "",
        description: e.description ?? "",
      }));

      const services = (servicesRes.data ?? []).map((sv) => ({
        icon: sv.icon ?? "Code2",
        title: sv.title,
        description: sv.description ?? "",
        price: sv.price ?? "",
        deliveryTime: sv.delivery_time ?? "",
        features: sv.features ?? [],
      }));

      const testimonials = (testiRes.data ?? []).map((t) => ({
        quote: t.quote,
        name: t.name,
        role: t.role ?? "",
      }));

      const hasDbContent =
        projects.length || skills.length || experience.length || services.length || testimonials.length;

      setData(
        mergeDefaults({
          personal: personal as PortfolioData["personal"],
          about: about as PortfolioData["about"],
          projects: hasDbContent && projects.length ? projects : defaultPortfolio.projects,
          skills: hasDbContent && skills.length ? skills : defaultPortfolio.skills,
          experience: hasDbContent && experience.length ? experience : defaultPortfolio.experience,
          services: hasDbContent && services.length ? services : defaultPortfolio.services,
          testimonials: hasDbContent && testimonials.length ? testimonials : defaultPortfolio.testimonials,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<Ctx>(
    () => ({
      ...data,
      loading,
      refresh: load,
      update: () => {},
      replace: () => {},
      reset: () => {},
      exportJSON: () => JSON.stringify(data, null, 2),
      importJSON: () => false,
    }),
    [data, loading, load],
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
};
