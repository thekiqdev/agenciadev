import { motion } from "framer-motion";
import { Mail, FileText, FolderOpen, TrendingUp } from "lucide-react";

interface DashboardOverviewProps {
  counts: {
    contacts: number;
    budgets: number;
    portfolio: number;
  };
  onNavigate: (section: string) => void;
}

const stats = [
  { 
    id: "contacts", 
    title: "Contatos", 
    icon: Mail, 
    color: "from-primary to-primary/50",
    description: "Mensagens recebidas"
  },
  { 
    id: "budgets", 
    title: "Orçamentos", 
    icon: FileText, 
    color: "from-secondary to-secondary/50",
    description: "Solicitações de orçamento"
  },
  { 
    id: "portfolio", 
    title: "Portfólio", 
    icon: FolderOpen, 
    color: "from-accent to-accent/50",
    description: "Itens cadastrados"
  },
];

export function DashboardOverview({ counts, onNavigate }: DashboardOverviewProps) {
  const getCount = (id: string) => {
    switch (id) {
      case "contacts": return counts.contacts;
      case "budgets": return counts.budgets;
      case "portfolio": return counts.portfolio;
      default: return 0;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onNavigate(stat.id)}
            className="cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity`} />
              
              <div className="relative">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                
                <p className="text-sm text-muted-foreground mb-1">{stat.description}</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-foreground">{getCount(stat.id)}</span>
                  <span className="text-sm text-muted-foreground mb-1">{stat.title}</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Acesso Rápido</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => onNavigate("contacts")}
            className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
          >
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Ver Contatos</p>
              <p className="text-xs text-muted-foreground">Gerenciar mensagens</p>
            </div>
          </button>
          <button
            onClick={() => onNavigate("budgets")}
            className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
          >
            <FileText className="w-5 h-5 text-secondary" />
            <div>
              <p className="font-medium text-foreground">Ver Orçamentos</p>
              <p className="text-xs text-muted-foreground">Gerenciar solicitações</p>
            </div>
          </button>
          <button
            onClick={() => onNavigate("portfolio")}
            className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
          >
            <FolderOpen className="w-5 h-5 text-accent" />
            <div>
              <p className="font-medium text-foreground">Ver Portfólio</p>
              <p className="text-xs text-muted-foreground">Gerenciar projetos</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
