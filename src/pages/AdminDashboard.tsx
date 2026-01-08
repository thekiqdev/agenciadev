import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  LogOut, 
  Mail, 
  FileText, 
  FolderOpen, 
  Plus, 
  Trash2, 
  Eye,
  X,
  RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { user, isAdmin, loading, signOut } = useAuth();
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-grid opacity-10" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gradient">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw size={16} className="mr-2" />
              Atualizar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted">
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Mail size={16} />
              Contatos ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <FileText size={16} />
              Orçamentos ({budgets.length})
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <FolderOpen size={16} />
              Portfólio ({portfolioItems.length})
            </TabsTrigger>
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {contacts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum contato recebido ainda.
                </div>
              ) : (
                <div className="grid gap-4">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="border border-border bg-card rounded-xl p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{contact.name}</h3>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(contact.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{contact.email}</p>
                          {contact.phone && (
                            <p className="text-sm text-muted-foreground mb-2">{contact.phone}</p>
                          )}
                          <p className="text-sm text-foreground line-clamp-2">{contact.message}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(contact)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteContact(contact.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {budgets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum orçamento recebido ainda.
                </div>
              ) : (
                <div className="grid gap-4">
                  {budgets.map((budget) => (
                    <div
                      key={budget.id}
                      className="border border-border bg-card rounded-xl p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground">{budget.name}</h3>
                            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                              {budget.project_type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(budget.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {budget.email} {budget.company && `| ${budget.company}`}
                          </p>
                          {budget.budget_range && (
                            <p className="text-sm text-accent mt-1">
                              Investimento: {budget.budget_range}
                            </p>
                          )}
                          <p className="text-sm text-foreground mt-2 line-clamp-2">
                            {budget.description}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedItem(budget)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBudget(budget.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Button
                onClick={() => {
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
                }}
                className="cyber-button"
              >
                <Plus size={18} className="mr-2" />
                <span>Novo Item</span>
              </Button>

              {portfolioItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum item no portfólio ainda.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="border border-border bg-card rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-primary uppercase">
                            {item.category}
                          </span>
                          {item.featured && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                              Destaque
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.technologies.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditPortfolio(item)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePortfolio(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

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
  );
};

export default AdminDashboard;
