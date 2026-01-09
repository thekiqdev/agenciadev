import { motion } from "framer-motion";
import { Eye, Trash2, FileText, Building, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface BudgetsSectionProps {
  budgets: BudgetSubmission[];
  onView: (budget: BudgetSubmission) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
}

export function BudgetsSection({ budgets, onView, onDelete, formatDate }: BudgetsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Orçamentos</h1>
        <p className="text-muted-foreground">Solicitações de orçamento recebidas</p>
      </div>

      {budgets.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum orçamento recebido ainda.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Investimento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium">{budget.name}</p>
                      <a href={`mailto:${budget.email}`} className="text-sm text-primary hover:underline">
                        {budget.email}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{budget.project_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {budget.company ? (
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-muted-foreground" />
                        {budget.company}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {budget.budget_range ? (
                      <span className="flex items-center gap-1 text-accent">
                        <DollarSign className="w-3 h-3" />
                        {budget.budget_range}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(budget.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onView(budget)}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDelete(budget.id)}>
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
