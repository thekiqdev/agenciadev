import { useState } from "react";
import { Plus, Pencil, Trash2, Package, Key, Code, Star } from "lucide-react";
import { motion } from "framer-motion";
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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  categories: string[];
  features: string[];
  image_url: string | null;
  popular: boolean;
  active: boolean;
  created_at: string;
}

interface ProductsSectionProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  formatDate: (date: string) => string;
  productCategories: CategoryEntry[];
}

function labelForSlug(slug: string, list: CategoryEntry[]) {
  return list.find((c) => c.slug === slug)?.label ?? slug;
}

const categoryIcons = {
  license: Key,
  system: Package,
  template: Code
};

export function ProductsSection({
  products,
  onEdit,
  onDelete,
  onNew,
  formatDate,
  productCategories,
}: ProductsSectionProps) {
  const stripHtml = (value: string) => value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Produtos da Loja</h2>
          <p className="text-muted-foreground">Gerencie os produtos digitais disponíveis na loja</p>
        </div>
        <Button onClick={onNew} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum produto cadastrado ainda.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const firstCategory = product.categories?.[0];
                const CategoryIcon = categoryIcons[firstCategory as keyof typeof categoryIcons] || Package;
                
                return (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{product.name}</span>
                            {product.popular && (
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {stripHtml(product.description)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(product.categories ?? []).map((category) => (
                          <Badge key={category} variant="outline" className="gap-1">
                            <CategoryIcon className="w-3 h-3" />
                            {labelForSlug(category, productCategories)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.active ? "default" : "secondary"}>
                        {product.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(product.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(product)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(product.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
