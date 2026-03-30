import { useEffect, useState } from "react";
import { Plus, Trash2, Tags } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryEntry } from "@/types/category";
import { DEFAULT_PORTFOLIO_CATEGORIES, DEFAULT_PRODUCT_CATEGORIES } from "@/types/category";

function slugifyInput(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");
}

type CategoriesSettingsProps = {
  portfolioCategories: CategoryEntry[];
  productCategories: CategoryEntry[];
  loading: boolean;
  onSave: (portfolio: CategoryEntry[], products: CategoryEntry[]) => Promise<void>;
};

export function CategoriesSettings({
  portfolioCategories,
  productCategories,
  loading,
  onSave,
}: CategoriesSettingsProps) {
  const [portfolio, setPortfolio] = useState<CategoryEntry[]>(portfolioCategories);
  const [products, setProducts] = useState<CategoryEntry[]>(productCategories);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPortfolio(portfolioCategories?.length ? portfolioCategories : DEFAULT_PORTFOLIO_CATEGORIES);
  }, [portfolioCategories]);

  useEffect(() => {
    setProducts(productCategories?.length ? productCategories : DEFAULT_PRODUCT_CATEGORIES);
  }, [productCategories]);

  const updatePortfolio = (index: number, field: keyof CategoryEntry, value: string) => {
    setPortfolio((prev) => {
      const next = [...prev];
      const row = { ...next[index] };
      if (field === "slug") row.slug = slugifyInput(value);
      else row.label = value;
      next[index] = row;
      return next;
    });
  };

  const updateProduct = (index: number, field: keyof CategoryEntry, value: string) => {
    setProducts((prev) => {
      const next = [...prev];
      const row = { ...next[index] };
      if (field === "slug") row.slug = slugifyInput(value);
      else row.label = value;
      next[index] = row;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pSlugs = new Set<string>();
    for (const row of portfolio) {
      if (!row.slug.trim() || !row.label.trim()) {
        toast.error("Preencha identificador e nome em todas as linhas do portfólio.");
        return;
      }
      if (pSlugs.has(row.slug)) {
        toast.error("Há identificadores duplicados no portfólio.");
        return;
      }
      pSlugs.add(row.slug);
    }
    const prSlugs = new Set<string>();
    for (const row of products) {
      if (!row.slug.trim() || !row.label.trim()) {
        toast.error("Preencha identificador e nome em todas as linhas da loja.");
        return;
      }
      if (prSlugs.has(row.slug)) {
        toast.error("Há identificadores duplicados na loja.");
        return;
      }
      prSlugs.add(row.slug);
    }
    if (portfolio.length === 0 || products.length === 0) {
      toast.error("Mantenha ao menos uma categoria em cada lista.");
      return;
    }

    setSaving(true);
    try {
      await onSave(portfolio, products);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <Tags className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
          <p className="text-sm text-muted-foreground">
            Defina os tipos usados nos filtros da loja e do portfólio e nas fichas de cadastro. O identificador (slug) não pode
            ter espaços; use letras minúsculas, números, hífen ou sublinhado.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-md font-semibold text-foreground">Portfólio</h3>
        <div className="space-y-3">
          {portfolio.map((row, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Identificador</Label>
                <Input
                  value={row.slug}
                  onChange={(e) => updatePortfolio(i, "slug", e.target.value)}
                  placeholder="ex.: sistemas"
                  className="bg-muted border-border font-mono text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nome exibido</Label>
                <Input
                  value={row.label}
                  onChange={(e) => updatePortfolio(i, "label", e.target.value)}
                  placeholder="ex.: Sistemas"
                  className="bg-muted border-border"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setPortfolio((p) => p.filter((_, j) => j !== i))}
                disabled={portfolio.length <= 1}
                aria-label="Remover categoria"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPortfolio((p) => [...p, { slug: "", label: "" }])}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar categoria de portfólio
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-md font-semibold text-foreground">Loja (produtos)</h3>
        <div className="space-y-3">
          {products.map((row, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Identificador</Label>
                <Input
                  value={row.slug}
                  onChange={(e) => updateProduct(i, "slug", e.target.value)}
                  placeholder="ex.: system"
                  className="bg-muted border-border font-mono text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nome exibido</Label>
                <Input
                  value={row.label}
                  onChange={(e) => updateProduct(i, "label", e.target.value)}
                  placeholder="ex.: Sistema"
                  className="bg-muted border-border"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => setProducts((p) => p.filter((_, j) => j !== i))}
                disabled={products.length <= 1}
                aria-label="Remover categoria"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setProducts((p) => [...p, { slug: "", label: "" }])}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar categoria de produto
        </Button>
      </section>

      <div className="flex justify-end">
        <Button type="submit" className="cyber-button" disabled={saving || loading}>
          <span>{saving ? "Salvando..." : "Salvar categorias"}</span>
        </Button>
      </div>
    </form>
  );
}
