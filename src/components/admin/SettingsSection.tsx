import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesSettings } from "@/components/admin/CategoriesSettings";
import type { CategoryEntry } from "@/types/category";

export interface AdminSiteSettings {
  site_name: string;
  seo_description: string;
  whatsapp_number: string;
  portfolio_categories: CategoryEntry[];
  product_categories: CategoryEntry[];
  updated_at?: string | null;
}

interface SettingsSectionProps {
  settings: AdminSiteSettings;
  loading: boolean;
  onSave: (settings: AdminSiteSettings) => Promise<void>;
  onSaveCategories: (portfolio: CategoryEntry[], products: CategoryEntry[]) => Promise<void>;
}

export function SettingsSection({ settings, loading, onSave, onSaveCategories }: SettingsSectionProps) {
  const [form, setForm] = useState<AdminSiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSubmitGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Configurações</h1>
        <p className="text-muted-foreground">Identidade do site, contato e categorias da loja e do portfólio</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted border border-border">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 space-y-6">
          <form onSubmit={handleSubmitGeneral} className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="site_name">Nome do site</Label>
              <Input
                id="site_name"
                value={form.site_name}
                onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                placeholder="Ex.: Agência Dev"
                required
                className="bg-muted border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo_description">Descrição SEO</Label>
              <Textarea
                id="seo_description"
                value={form.seo_description}
                onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                placeholder="Descrição usada em SEO e identidade do projeto"
                required
                rows={4}
                className="bg-muted border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp</Label>
              <Input
                id="whatsapp_number"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="5511999999999"
                required
                className="bg-muted border-border"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {loading
                  ? "Carregando..."
                  : settings.updated_at
                    ? `Última atualização: ${new Date(settings.updated_at).toLocaleString("pt-BR")}`
                    : "Sem histórico de atualização"}
              </p>
              <Button type="submit" className="cyber-button" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                <span>{saving ? "Salvando..." : "Salvar configurações"}</span>
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesSettings
            portfolioCategories={settings.portfolio_categories}
            productCategories={settings.product_categories}
            loading={loading}
            onSave={onSaveCategories}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
