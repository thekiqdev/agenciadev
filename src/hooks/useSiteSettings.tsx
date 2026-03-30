import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/integrations/api/client";
import type { CategoryEntry } from "@/types/category";
import { DEFAULT_PORTFOLIO_CATEGORIES, DEFAULT_PRODUCT_CATEGORIES } from "@/types/category";

export interface SiteSettings {
  site_name: string;
  seo_description: string;
  whatsapp_number: string;
  portfolio_categories: CategoryEntry[];
  product_categories: CategoryEntry[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "Agencia Dev",
  seo_description: "Transformando ideias em soluções digitais inovadoras.",
  whatsapp_number: "5511999999999",
  portfolio_categories: DEFAULT_PORTFOLIO_CATEGORIES,
  product_categories: DEFAULT_PRODUCT_CATEGORIES,
};

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

function applyMeta(settings: SiteSettings) {
  document.title = settings.site_name;

  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", settings.seo_description);
}

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await apiFetch<Partial<SiteSettings>>("/api/settings");
      const merged: SiteSettings = {
        ...DEFAULT_SETTINGS,
        ...data,
        portfolio_categories: data.portfolio_categories?.length
          ? data.portfolio_categories
          : DEFAULT_SETTINGS.portfolio_categories,
        product_categories: data.product_categories?.length
          ? data.product_categories
          : DEFAULT_SETTINGS.product_categories,
      };
      setSettings(merged);
      applyMeta(merged);
    } catch {
      applyMeta(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(() => ({ settings, loading, refresh }), [settings, loading]);
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }
  return context;
}
