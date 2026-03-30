import { motion } from "framer-motion";
import { Plus, Trash2, Edit, FolderOpen, ExternalLink, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CategoryEntry } from "@/types/category";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  categories: string[];
  image_url: string | null;
  technologies: string[];
  link: string | null;
  featured: boolean;
  created_at: string;
}

interface PortfolioSectionProps {
  items: PortfolioItem[];
  onEdit: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  formatDate: (date: string) => string;
  portfolioCategories: CategoryEntry[];
}

function labelForSlug(slug: string, list: CategoryEntry[]) {
  return list.find((c) => c.slug === slug)?.label ?? slug;
}

export function PortfolioSection({
  items,
  onEdit,
  onDelete,
  onNew,
  formatDate,
  portfolioCategories,
}: PortfolioSectionProps) {
  const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Portfólio</h1>
          <p className="text-muted-foreground">Gerenciar itens do portfólio</p>
        </div>
        <Button onClick={onNew} className="cyber-button">
          <Plus size={18} className="mr-2" />
          <span>Novo Item</span>
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Nenhum item no portfólio ainda.</p>
          <Button onClick={onNew} variant="outline">
            <Plus size={16} className="mr-2" />
            Adicionar primeiro item
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Projeto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tecnologias</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                          <FolderOpen className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                          {stripHtml(item.description)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(item.categories ?? []).map((category) => (
                        <Badge key={category} variant="outline">
                          {labelForSlug(category, portfolioCategories)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {item.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {item.technologies.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.technologies.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.featured && (
                        <Badge className="bg-accent/10 text-accent border-accent/20">
                          <Star className="w-3 h-3 mr-1" />
                          Destaque
                        </Badge>
                      )}
                      {item.link && (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
