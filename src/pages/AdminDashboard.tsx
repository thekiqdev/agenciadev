import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { X, Menu } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
  category: string;
  image_url: string | null;
  technologies: string[];
  link: string | null;
  featured: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [budgets, setBudgets] = useState<BudgetSubmission[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContactSubmission | BudgetSubmission | null>(null);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);

  const [portfolioForm, setPortfolioForm] = useState({
    title: "",
    description: "",
    category: "",
    image_url: "",
    technologies: "",
    link: "",
    featured: false,
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
      const [contactsRes, budgetsRes, portfolioRes] = await Promise.all([
        supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("budget_submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("portfolio_items").select("*").order("created_at", { ascending: false }),
      ]);

      if (contactsRes.error) throw contactsRes.error;
      if (budgetsRes.error) throw budgetsRes.error;
      if (portfolioRes.error) throw portfolioRes.error;

      setContacts(contactsRes.data || []);
      setBudgets(budgetsRes.data || []);
      setPortfolioItems(portfolioRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;
    
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir contato");
      return;
    }
    toast.success("Contato excluído");
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este orçamento?")) return;
    
    const { error } = await supabase.from("budget_submissions").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir orçamento");
      return;
    }
    toast.success("Orçamento excluído");
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item do portfólio?")) return;
    
    const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir item");
      return;
    }
    toast.success("Item excluído");
    setPortfolioItems(portfolioItems.filter((p) => p.id !== id));
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const techArray = portfolioForm.technologies.split(",").map((t) => t.trim()).filter(Boolean);
    
    const data = {
      title: portfolioForm.title,
      description: portfolioForm.description,
      category: portfolioForm.category,
      image_url: portfolioForm.image_url || null,
      technologies: techArray,
      link: portfolioForm.link || null,
      featured: portfolioForm.featured,
    };

    if (editingPortfolio) {
      const { error } = await supabase
        .from("portfolio_items")
        .update(data)
        .eq("id", editingPortfolio.id);
      
      if (error) {
        toast.error("Erro ao atualizar item");
        return;
      }
      toast.success("Item atualizado");
    } else {
      const { error } = await supabase.from("portfolio_items").insert(data);
      
      if (error) {
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
      category: "",
      image_url: "",
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
      category: item.category,
      image_url: item.image_url || "",
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
      category: "",
      image_url: "",
      technologies: "",
      link: "",
      featured: false,
    });
    setShowPortfolioForm(true);
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
                  <Label htmlFor="category">Categoria *</Label>
                  <select
                    id="category"
                    value={portfolioForm.category}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-md bg-muted border border-border text-foreground"
                  >
                    <option value="">Selecione...</option>
                    <option value="sistemas">Sistemas</option>
                    <option value="plataformas">Plataformas</option>
                    <option value="saas">SaaS</option>
                    <option value="sites">Sites</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                    required
                    rows={4}
                    className="bg-muted border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <Input
                    id="image_url"
                    value={portfolioForm.image_url}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, image_url: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="bg-muted border-border"
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
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
