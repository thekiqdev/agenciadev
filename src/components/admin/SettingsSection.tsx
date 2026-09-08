import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesSettings } from "@/components/admin/CategoriesSettings";
import type { CategoryEntry } from "@/types/category";

export interface AdminSiteSettings {
  site_name: string;
  seo_description: string;
  whatsapp_number: string;
  contact_email: string;
  contact_phone: string;
  contact_location: string;
  contact_hours: string;
  portfolio_categories: CategoryEntry[];
  product_categories: CategoryEntry[];
  smtp_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_pass: string;
  smtp_pass_configured?: boolean;
  smtp_from: string;
  smtp_to: string;
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
  const [tab, setTab] = useState("general");

  useEffect(() => {
    setForm({ ...settings, smtp_pass: "" });
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof AdminSiteSettings>(key: K, value: AdminSiteSettings[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveBar = (
    <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4">
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
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Identidade do site, dados de contato, SMTP e categorias
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted border border-border">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="smtp">E-mail SMTP</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="general" className="mt-6 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="site_name">Nome do site</Label>
                <Input
                  id="site_name"
                  value={form.site_name}
                  onChange={(e) => setField("site_name", e.target.value)}
                  placeholder="Ex.: Agência Dev"
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">Descrição SEO</Label>
                <Textarea
                  id="seo_description"
                  value={form.seo_description}
                  onChange={(e) => setField("seo_description", e.target.value)}
                  placeholder="Descrição usada em SEO e identidade do projeto"
                  rows={4}
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">WhatsApp</Label>
                <Input
                  id="whatsapp_number"
                  value={form.whatsapp_number}
                  onChange={(e) => setField("whatsapp_number", e.target.value)}
                  placeholder="5511999999999"
                  className="bg-muted border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Número com DDI (ex.: 5511999999999), usado no botão flutuante.
                </p>
              </div>
            </div>
            {saveBar}
          </TabsContent>

          <TabsContent value="contact" className="mt-6 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <p className="text-sm text-muted-foreground">
                Esses dados aparecem na página Contato e no rodapé do site.
              </p>

              <div className="space-y-2">
                <Label htmlFor="contact_email">E-mail de contato</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setField("contact_email", e.target.value)}
                  placeholder="contato@seusite.com.br"
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">WhatsApp</Label>
                <Input
                  id="contact_phone"
                  value={form.contact_phone}
                  onChange={(e) => setField("contact_phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_location">Localização</Label>
                <Input
                  id="contact_location"
                  value={form.contact_location}
                  onChange={(e) => setField("contact_location", e.target.value)}
                  placeholder="São Paulo, SP - Brasil"
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_hours">Horário de atendimento</Label>
                <Input
                  id="contact_hours"
                  value={form.contact_hours}
                  onChange={(e) => setField("contact_hours", e.target.value)}
                  placeholder="Seg - Sex: 9h às 18h"
                  className="bg-muted border-border"
                />
              </div>
            </div>
            {saveBar}
          </TabsContent>

          <TabsContent value="smtp" className="mt-6 space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <p className="text-sm text-muted-foreground">
                Quando ativo, contatos e orçamentos enviados pelo site também chegam por e-mail.
              </p>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
                <div>
                  <Label htmlFor="smtp_enabled">Ativar envio por SMTP</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requer host, usuário, senha e destinatário (ou e-mail de contato).
                  </p>
                </div>
                <Switch
                  id="smtp_enabled"
                  checked={form.smtp_enabled}
                  onCheckedChange={(checked) => setField("smtp_enabled", checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="smtp_host">Host SMTP</Label>
                  <Input
                    id="smtp_host"
                    value={form.smtp_host}
                    onChange={(e) => setField("smtp_host", e.target.value)}
                    placeholder="smtp.seudominio.com"
                    className="bg-muted border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">Porta</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={form.smtp_port}
                    onChange={(e) => setField("smtp_port", Number(e.target.value) || 587)}
                    placeholder="587"
                    className="bg-muted border-border"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
                  <div>
                    <Label htmlFor="smtp_secure">TLS/SSL (porta 465)</Label>
                    <p className="text-xs text-muted-foreground mt-1">Desligado para STARTTLS (587).</p>
                  </div>
                  <Switch
                    id="smtp_secure"
                    checked={form.smtp_secure}
                    onCheckedChange={(checked) => setField("smtp_secure", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_user">Usuário</Label>
                  <Input
                    id="smtp_user"
                    value={form.smtp_user}
                    onChange={(e) => setField("smtp_user", e.target.value)}
                    placeholder="usuario@seudominio.com"
                    className="bg-muted border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_pass">Senha</Label>
                  <Input
                    id="smtp_pass"
                    type="password"
                    value={form.smtp_pass}
                    onChange={(e) => setField("smtp_pass", e.target.value)}
                    placeholder={
                      settings.smtp_pass_configured ? "•••••••• (deixe em branco para manter)" : "Senha SMTP"
                    }
                    className="bg-muted border-border"
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_from">Remetente (From)</Label>
                  <Input
                    id="smtp_from"
                    value={form.smtp_from}
                    onChange={(e) => setField("smtp_from", e.target.value)}
                    placeholder="Opcional — padrão: usuário SMTP"
                    className="bg-muted border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_to">Destinatário das notificações</Label>
                  <Input
                    id="smtp_to"
                    type="email"
                    value={form.smtp_to}
                    onChange={(e) => setField("smtp_to", e.target.value)}
                    placeholder="Opcional — padrão: e-mail de contato"
                    className="bg-muted border-border"
                  />
                </div>
              </div>
            </div>
            {saveBar}
          </TabsContent>
        </form>

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
