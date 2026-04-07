import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionTableProps {
  transactions: Transaction[]
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-elevation animate-fade-in">
      <Table>
        <TableHeader className="bg-background/50">
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="font-display font-bold w-[120px]">Tipo</TableHead>
            <TableHead className="font-display font-bold">Cliente/Fornecedor</TableHead>
            <TableHead className="font-display font-bold hidden lg:table-cell">Categoria</TableHead>
            <TableHead className="font-display font-bold text-right">Valor</TableHead>
            <TableHead className="font-display font-bold text-right w-[150px]">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow
              key={txn.id}
              className="border-border hover:bg-background/40 transition-colors group"
            >
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-medium border-transparent',
                    txn.type === 'RECEITA'
                      ? 'bg-success/15 text-success hover:bg-success/25'
                      : 'bg-destructive/15 text-destructive hover:bg-destructive/25',
                  )}
                >
                  {txn.type === 'RECEITA' ? 'Receita' : 'Despesa'}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{txn.entity}</TableCell>
              <TableCell className="text-muted-foreground hidden lg:table-cell">
                {txn.category}
              </TableCell>
              <TableCell
                className={cn(
                  'text-right font-bold',
                  txn.type === 'RECEITA' ? 'text-success' : 'text-destructive',
                )}
              >
                {txn.type === 'RECEITA' ? '+' : '-'}
                {formatCurrency(txn.amount)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDate(txn.date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-lg bg-card shadow-elevation animate-fade-in">
      <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground opacity-50" />
      </div>
      <h3 className="font-display text-xl font-bold text-foreground">
        Nenhuma transação encontrada
      </h3>
      <p className="text-muted-foreground text-sm max-w-sm mt-2">
        Tente ajustar os filtros de período ou termo de busca para encontrar o que procura.
      </p>
    </div>
  )
}
