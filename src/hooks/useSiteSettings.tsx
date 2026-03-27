import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/integrations/api/client";

export interface SiteSettings {
  site_name: string;
  seo_description: string;
  whatsapp_number: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "Agencia Dev",
  seo_description: "Transformando ideias em soluções digitais inovadoras.",
  whatsapp_number: "5511999999999",
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
      const merged = {
        ...DEFAULT_SETTINGS,
        ...data,
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
