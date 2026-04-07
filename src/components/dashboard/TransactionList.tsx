import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-border rounded-lg bg-card animate-fade-in">
        <Inbox className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
        <h3 className="font-display text-lg font-bold">Sem resultados</h3>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      {transactions.map((txn) => (
        <Card
          key={txn.id}
          className="bg-card border-border hover:border-border/80 transition-colors"
        >
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-bold text-base leading-none">{txn.entity}</p>
                <p className="text-xs text-muted-foreground">{txn.category}</p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'font-medium border-transparent text-[10px] px-2 py-0',
                  txn.type === 'RECEITA'
                    ? 'bg-success/15 text-success'
                    : 'bg-destructive/15 text-destructive',
                )}
              >
                {txn.type === 'RECEITA' ? 'Receita' : 'Despesa'}
              </Badge>
            </div>

            <div className="flex justify-between items-end mt-1 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">{formatDate(txn.date)}</p>
              <p
                className={cn(
                  'font-bold text-lg leading-none',
                  txn.type === 'RECEITA' ? 'text-success' : 'text-destructive',
                )}
              >
                {txn.type === 'RECEITA' ? '+' : '-'}
                {formatCurrency(txn.amount)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
