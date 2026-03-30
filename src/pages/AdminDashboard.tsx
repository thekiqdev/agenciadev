import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { X, Menu } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { GalleryUploadList } from "@/components/admin/GalleryUploadList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { ContactsSection } from "@/components/admin/ContactsSection";
import { BudgetsSection } from "@/components/admin/BudgetsSection";
import { PortfolioSection } from "@/components/admin/PortfolioSection";
import { ProductsSection } from "@/components/admin/ProductsSection";
import { SettingsSection } from "@/components/admin/SettingsSection";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/integrations/api/client";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

interface BudgetSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  project_type: string;
  deadline: string | null;
  budget_range: string | null;
  description: string;
  created_at: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  categories: string[];
  image_url: string | null;
  gallery_urls?: string[] | null;
  technologies: string[];
  link: string | null;
  featured: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  categories: string[];
  features: string[];
  image_url: string | null;
  gallery_urls?: string[] | null;
  popular: boolean;
  active: boolean;
  created_at: string;
}

interface SiteSettings {
  site_name: string;
  seo_description: string;
  whatsapp_number: string;
  updated_at?: string | null;
}

const portfolioCategoryOptions = ["sistemas", "plataformas", "saas", "sites"];
const productCategoryOptions = ["system", "license", "template"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [budgets, setBudgets] = useState<BudgetSubmission[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContactSubmission | BudgetSubmission | null>(null);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "Agencia Dev",
    seo_description: "",
    whatsapp_number: "",
    updated_at: null,
  });

  const toggleSelection = (value: string, selected: string[]) =>
    selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];

  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    categories: [] as string[],
    image_url: "",
    gallery_urls: [] as string[],
    technologies: "",
    link: "",
    featured: false,
  });

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    categories: [] as string[],
    features: "",
    image_url: "",
    gallery_urls: [] as string[],
    popular: false,
    active: true,
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admindev/login");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch<{
        contacts: ContactSubmission[];
        budgets: BudgetSubmission[];
        portfolio: PortfolioItem[];
        products: Product[];
      }>("/api/admin/dashboard");

      setContacts(data.contacts || []);
      setBudgets(data.budgets || []);
      setPortfolioItems(data.portfolio || []);
      setProducts(data.products || []);
      const settingsData = await apiFetch<SiteSettings>("/api/admin/settings");
      setSettings(settingsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;
    
    try {
      await apiFetch(`/api/admin/contact-submissions/${id}`, { method: "DELETE" });
    } catch {
      toast.error("Erro ao excluir contato");
      return;
    }
    toast.success("Contato excluído");
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;
    
    try {
      await apiFetch(`/api/admin/budget-submissions/${id}`, { method: "DELETE" });
    } catch {
      toast.error("Erro ao excluir orçamento");
      return;
    }
    toast.success("Orçamento excluído");
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item do portfólio?")) return;
    
    try {
      await apiFetch(`/api/admin/portfolio-items/${id}`, { method: "DELETE" });
    } catch {
      toast.error("Erro ao excluir item");
      return;
    }
    toast.success("Item excluído");
    setPortfolioItems(portfolioItems.filter((p) => p.id !== id));
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    
    try {
      await apiFetch(`/api/admin/products/${id}`, { method: "DELETE" });
    } catch {
      toast.error("Erro ao excluir produto");
      return;
    }
    toast.success("Produto excluído");
    setProducts(products.filter((p) => p.id !== id));
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (portfolioForm.categories.length === 0) {
      toast.error("Selecione ao menos uma categoria no portfólio");
      return;
    }
    
    const techArray = portfolioForm.technologies.split(",").map((t) => t.trim()).filter(Boolean);
    const galleryUrls = portfolioForm.gallery_urls.map((u) => u.trim()).filter(Boolean);

    const data = {
      title: portfolioForm.title,
      description: portfolioForm.description,
      categories: portfolioForm.categories,
      image_url: portfolioForm.image_url || null,
      gallery_urls: galleryUrls,
      technologies: techArray,
      link: portfolioForm.link || null,
      featured: portfolioForm.featured,
    };

    if (editingPortfolio) {
      try {
        await apiFetch(`/api/admin/portfolio-items/${editingPortfolio.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch {
        toast.error("Erro ao atualizar item");
        return;
      }
      toast.success("Item atualizado");
    } else {
      try {
        await apiFetch("/api/admin/portfolio-items", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch {
        toast.error("Erro ao criar item");
        return;
      }
      toast.success("Item criado");
    }

    setShowPortfolioForm(false);
    setEditingPortfolio(null);
    setPortfolioForm({
      title: "",
      description: "",
      categories: [],
      image_url: "",
      gallery_urls: [],
      technologies: "",
      link: "",
      featured: false,
    });
    fetchData();
  };

  const openEditPortfolio = (item: PortfolioItem) => {
    setEditingPortfolio(item);
    setPortfolioForm({
      title: item.title,
      description: item.description,
      categories: item.categories ?? [],
      image_url: item.image_url || "",
      gallery_urls: [...(item.gallery_urls ?? [])],
      technologies: item.technologies.join(", "),
      link: item.link || "",
      featured: item.featured,
    });
    setShowPortfolioForm(true);
  };

  const openNewPortfolio = () => {
    setEditingPortfolio(null);
    setPortfolioForm({
      title: "",
      description: "",
      categories: [],
      image_url: "",
      gallery_urls: [],
      technologies: "",
      link: "",
      featured: false,
    });
    setShowPortfolioForm(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productForm.categories.length === 0) {
      toast.error("Selecione ao menos uma categoria no produto");
      return;
    }
    
    const featuresArray = productForm.features.split(",").map((f) => f.trim()).filter(Boolean);
    const productGalleryUrls = productForm.gallery_urls.map((u) => u.trim()).filter(Boolean);

    const data = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      categories: productForm.categories,
      features: featuresArray,
      image_url: productForm.image_url || null,
      gallery_urls: productGalleryUrls,
      popular: productForm.popular,
      active: productForm.active,
    };

    if (editingProduct) {
      try {
        await apiFetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } catch {
        toast.error("Erro ao atualizar produto");
        return;
      }
      toast.success("Produto atualizado");
    } else {
      try {
        await apiFetch("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch {
        toast.error("Erro ao criar produto");
        return;
      }
      toast.success("Produto criado");
    }

    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      original_price: "",
      categories: [],
      features: "",
      image_url: "",
      gallery_urls: [],
      popular: false,
      active: true,
    });
    fetchData();
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      original_price: product.original_price?.toString() || "",
      categories: product.categories ?? [],
      features: product.features.join(", "),
      image_url: product.image_url || "",
      gallery_urls: [...(product.gallery_urls ?? [])],
      popular: product.popular,
      active: product.active,
    });
    setShowProductForm(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: "",
      original_price: "",
      categories: [],
      features: "",
      image_url: "",
      gallery_urls: [],
      popular: false,
      active: true,
    });
    setShowProductForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Carregando...</div>
      </div>
    );
  }

  const counts = {
    contacts: contacts.length,
    budgets: budgets.length,
    portfolio: portfolioItems.length,
    products: products.length,
  };

  const saveSettings = async (nextSettings: SiteSettings) => {
    const data = await apiFetch<SiteSettings>("/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({
        site_name: nextSettings.site_name,
        seo_description: nextSettings.seo_description,
        whatsapp_number: nextSettings.whatsapp_number,
      }),
    });
    setSettings(data);
    toast.success("Configurações atualizadas com sucesso");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          counts={counts}
          onRefresh={fetchData}
        />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-4 px-6 py-4">
              <SidebarTrigger>
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">
                  {activeSection === "dashboard" && "Dashboard"}
                  {activeSection === "contacts" && "Contatos"}
                  {activeSection === "budgets" && "Orçamentos"}
                  {activeSection === "portfolio" && "Portfólio"}
                  {activeSection === "products" && "Produtos"}
                  {activeSection === "settings" && "Configurações"}
                </h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {activeSection === "dashboard" && (
              <DashboardOverview counts={counts} onNavigate={setActiveSection} />
            )}
            {activeSection === "contacts" && (
              <ContactsSection
                contacts={contacts}
                onView={setSelectedItem}
                onDelete={handleDeleteContact}
                formatDate={formatDate}
              />
            )}
            {activeSection === "budgets" && (
              <BudgetsSection
                budgets={budgets}
                onView={setSelectedItem}
                onDelete={handleDeleteBudget}
                formatDate={formatDate}
              />
            )}
            {activeSection === "portfolio" && (
              <PortfolioSection
                items={portfolioItems}
                onEdit={openEditPortfolio}
                onDelete={handleDeletePortfolio}
                onNew={openNewPortfolio}
                formatDate={formatDate}
              />
            )}
            {activeSection === "products" && (
              <ProductsSection
                products={products}
                onEdit={openEditProduct}
                onDelete={handleDeleteProduct}
                onNew={openNewProduct}
                formatDate={formatDate}
              />
            )}
            {activeSection === "settings" && (
              <SettingsSection settings={settings} loading={isLoading} onSave={saveSettings} />
            )}
          </main>
        </div>

        {/* Detail Modal */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  {"project_type" in selectedItem ? "Solicitação de Orçamento" : "Mensagem de Contato"}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="text-foreground">{selectedItem.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-foreground">{selectedItem.email}</p>
                </div>
                {selectedItem.phone && (
                  <div>
                    <Label className="text-muted-foreground">Telefone</Label>
                    <p className="text-foreground">{selectedItem.phone}</p>
                  </div>
                )}
                {"project_type" in selectedItem && (
                  <>
                    {selectedItem.company && (
                      <div>
                        <Label className="text-muted-foreground">Empresa</Label>
                        <p className="text-foreground">{selectedItem.company}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Tipo de Projeto</Label>
                      <p className="text-foreground">{selectedItem.project_type}</p>
                    </div>
                    {selectedItem.budget_range && (
                      <div>
                        <Label className="text-muted-foreground">Investimento</Label>
                        <p className="text-foreground">{selectedItem.budget_range}</p>
                      </div>
                    )}
                    {selectedItem.deadline && (
                      <div>
                        <Label className="text-muted-foreground">Prazo</Label>
                        <p className="text-foreground">{selectedItem.deadline}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Descrição</Label>
                      <p className="text-foreground whitespace-pre-wrap">{selectedItem.description}</p>
                    </div>
                  </>
                )}
                {"message" in selectedItem && (
                  <div>
                    <Label className="text-muted-foreground">Mensagem</Label>
                    <p className="text-foreground whitespace-pre-wrap">{selectedItem.message}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Enviado em</Label>
                  <p className="text-foreground">{formatDate(selectedItem.created_at)}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Portfolio Form Modal */}
        {showPortfolioForm && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPortfolioForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editingPortfolio ? "Editar Item" : "Novo Item do Portfólio"}
                </h2>
                <button
                  onClick={() => setShowPortfolioForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handlePortfolioSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                    required
                    className="bg-muted border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categorias *</Label>
                  <div className="flex flex-wrap gap-2">
                    {portfolioCategoryOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 text-sm rounded-md border border-border px-3 py-2">
                        <input
                          type="checkbox"
                          checked={portfolioForm.categories.includes(option)}
                          onChange={() =>
                            setPortfolioForm({
                              ...portfolioForm,
                              categories: toggleSelection(option, portfolioForm.categories),
                            })
                          }
                        />
                        <span className="capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição *</Label>
                  <RichTextEditor
                    value={portfolioForm.description}
                    onChange={(value) => setPortfolioForm({ ...portfolioForm, description: value })}
                    placeholder="Descreva o item do portfólio"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Imagem do Portfólio</Label>
                  <ImageUpload
                    value={portfolioForm.image_url}
                    onChange={(url) => setPortfolioForm({ ...portfolioForm, image_url: url })}
                    bucket="product-images"
                    folder="portfolio"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Galeria</Label>
                  <GalleryUploadList
                    value={portfolioForm.gallery_urls}
                    onChange={(gallery_urls) => setPortfolioForm({ ...portfolioForm, gallery_urls })}
                    bucket="product-images"
                    folder="portfolio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="technologies">Tecnologias (separadas por vírgula)</Label>
                  <Input
                    id="technologies"
                    value={portfolioForm.technologies}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, technologies: e.target.value })}
                    placeholder="React, Node.js, PostgreSQL"
                    className="bg-muted border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Link do Projeto</Label>
                  <Input
                    id="link"
                    value={portfolioForm.link}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, link: e.target.value })}
                    placeholder="https://exemplo.com"
                    className="bg-muted border-border"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={portfolioForm.featured}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, featured: e.target.checked })}
                    className="rounded border-border"
                  />
                  <Label htmlFor="featured">Destaque na Home</Label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1 cyber-button">
                    <span>{editingPortfolio ? "Salvar Alterações" : "Criar Item"}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPortfolioForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowProductForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h2>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Nome do Produto *</Label>
                  <Input
                    id="product-name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    className="bg-muted border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categorias *</Label>
                  <div className="flex flex-wrap gap-2">
                    {productCategoryOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 text-sm rounded-md border border-border px-3 py-2">
                        <input
                          type="checkbox"
                          checked={productForm.categories.includes(option)}
                          onChange={() =>
                            setProductForm({
                              ...productForm,
                              categories: toggleSelection(option, productForm.categories),
                            })
                          }
                        />
                        <span className="capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição *</Label>
                  <RichTextEditor
                    value={productForm.description}
                    onChange={(value) => setProductForm({ ...productForm, description: value })}
                    placeholder="Descreva o produto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Preço (R$) *</Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-original-price">Preço Original (R$)</Label>
                    <Input
                      id="product-original-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.original_price}
                      onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                      placeholder="Para mostrar desconto"
                      className="bg-muted border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Imagem do Produto</Label>
                  <ImageUpload
                    value={productForm.image_url}
                    onChange={(url) => setProductForm({ ...productForm, image_url: url })}
                    bucket="product-images"
                    folder="products"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Galeria</Label>
                  <GalleryUploadList
                    value={productForm.gallery_urls}
                    onChange={(gallery_urls) => setProductForm({ ...productForm, gallery_urls })}
                    bucket="product-images"
                    folder="products"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-features">Recursos (separados por vírgula)</Label>
                  <Textarea
                    id="product-features"
                    value={productForm.features}
                    onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                    placeholder="Dashboard completo, Gestão de estoque, Relatórios"
                    rows={3}
                    className="bg-muted border-border"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="product-popular"
                      checked={productForm.popular}
                      onChange={(e) => setProductForm({ ...productForm, popular: e.target.checked })}
                      className="rounded border-border"
                    />
                    <Label htmlFor="product-popular">Marcar como Popular</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="product-active"
                      checked={productForm.active}
                      onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })}
                      className="rounded border-border"
                    />
                    <Label htmlFor="product-active">Produto Ativo</Label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1 cyber-button">
                    <span>{editingProduct ? "Salvar Alterações" : "Criar Produto"}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowProductForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
