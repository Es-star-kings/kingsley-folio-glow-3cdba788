import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { defaultPortfolio, PortfolioData } from "@/data/portfolio";

const STORAGE_KEY = "kingsley.portfolio.v1";

type Ctx = PortfolioData & {
  update: (patch: Partial<PortfolioData>) => void;
  replace: (data: PortfolioData) => void;
  reset: () => void;
  exportJSON: () => string;
  importJSON: (raw: string) => boolean;
};

const PortfolioContext = createContext<Ctx | null>(null);

const mergeWithDefaults = (stored: Partial<PortfolioData> | null): PortfolioData => ({
  ...defaultPortfolio,
  ...(stored || {}),
  personal: { ...defaultPortfolio.personal, ...(stored?.personal || {}) },
  about: { ...defaultPortfolio.about, ...(stored?.about || {}) },
});

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<PortfolioData>(() => {
    if (typeof window === "undefined") return defaultPortfolio;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return mergeWithDefaults(raw ? JSON.parse(raw) : null);
    } catch {
      return defaultPortfolio;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore quota */
    }
  }, [data]);

  const update = useCallback((patch: Partial<PortfolioData>) => {
    setData((d) => ({ ...d, ...patch }));
  }, []);

  const replace = useCallback((next: PortfolioData) => setData(next), []);

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setData(defaultPortfolio);
  }, []);

  const exportJSON = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const importJSON = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      setData(mergeWithDefaults(parsed));
      return true;
    } catch {
      return false;
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ ...data, update, replace, reset, exportJSON, importJSON }),
    [data, update, replace, reset, exportJSON, importJSON]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
};
