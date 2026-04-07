import { useAnimatedNumber } from '@/hooks/use-animated-number'
import { formatCurrency } from '@/lib/utils'
import { SummaryData } from '@/types'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  data: SummaryData
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const animatedReceitas = useAnimatedNumber(data.receitas)
  const animatedDespesas = useAnimatedNumber(data.despesas)
  const animatedSaldo = useAnimatedNumber(data.saldo)

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 mb-8 animate-fade-in-up">
      <Card className="bg-card border-border shadow-elevation hover:border-border/80 transition-colors">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground font-display">
            Total de Receitas
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-display text-3xl font-extrabold text-success tracking-tight">
            {formatCurrency(animatedReceitas)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-elevation hover:border-border/80 transition-colors">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground font-display">
            Total de Despesas
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="font-display text-3xl font-extrabold text-destructive tracking-tight">
            {formatCurrency(animatedDespesas)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-elevation hover:border-border/80 transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <CardHeader className="pb-2 flex flex-row items-center justify-between relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground font-display">
            Saldo Líquido
          </CardTitle>
          <div
            className={cn(
              'h-8 w-8 rounded-full flex items-center justify-center',
              data.saldo >= 0 ? 'bg-primary/10' : 'bg-muted',
            )}
          >
            <Wallet
              className={cn('h-4 w-4', data.saldo >= 0 ? 'text-primary' : 'text-muted-foreground')}
            />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div
            className={cn(
              'font-display text-3xl font-extrabold tracking-tight',
              data.saldo > 0
                ? 'text-primary'
                : data.saldo < 0
                  ? 'text-destructive'
                  : 'text-foreground',
            )}
          >
            {formatCurrency(animatedSaldo)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
