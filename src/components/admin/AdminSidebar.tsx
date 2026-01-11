import { useLocation, useNavigate } from "react-router-dom";
import { 
  Mail, 
  FileText, 
  FolderOpen, 
  LogOut,
  LayoutDashboard,
  RefreshCw,
  ShoppingBag
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  counts: {
    contacts: number;
    budgets: number;
    portfolio: number;
    products: number;
  };
  onRefresh: () => void;
}

const menuItems = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "contacts", title: "Contatos", icon: Mail },
  { id: "budgets", title: "Orçamentos", icon: FileText },
  { id: "portfolio", title: "Portfólio", icon: FolderOpen },
  { id: "products", title: "Produtos", icon: ShoppingBag },
];

export function AdminSidebar({ activeSection, onSectionChange, counts, onRefresh }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getCount = (id: string) => {
    switch (id) {
      case "contacts": return counts.contacts;
      case "budgets": return counts.budgets;
      case "portfolio": return counts.portfolio;
      case "products": return counts.products;
      default: return null;
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-sidebar-foreground">Admin</h2>
              <p className="text-xs text-muted-foreground">Painel de Controle</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const count = getCount(item.id);
                const isActive = activeSection === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      className={`w-full justify-start gap-3 ${
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-primary font-medium" 
                          : "hover:bg-sidebar-accent/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {count !== null && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                              {count}
                            </span>
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="w-full justify-start gap-2 text-foreground border-border hover:bg-muted"
        >
          <RefreshCw size={16} />
          {!isCollapsed && "Atualizar"}
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-destructive-foreground"
        >
          <LogOut size={16} />
          {!isCollapsed && "Sair"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
