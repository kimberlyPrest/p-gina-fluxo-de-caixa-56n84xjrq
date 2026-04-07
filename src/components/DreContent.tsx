import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface CategoriaResumo {
  nome: string
  valor: number
  percentual: number
}

export interface DreData {
  totalReceitas: number
  totalDespesas: number
  resultadoLiquido: number
  margemLiquida: number
  categoriasReceitas: CategoriaResumo[]
  categoriasDespesas: CategoriaResumo[]
}

interface DreContentProps {
  data: DreData | null
  isLoading: boolean
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

interface SummaryCardProps {
  title: string
  icon: LucideIcon
  value: string
  valueClass?: string
  iconClass?: string
}

function SummaryCard({ title, icon: Icon, value, valueClass, iconClass }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconClass)} />
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueClass)}>{value}</div>
      </CardContent>
    </Card>
  )
}

export function DreContent({ data, isLoading }: DreContentProps) {
  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  const resultColor = data.resultadoLiquido >= 0 ? 'text-emerald-600' : 'text-red-600'
  const resultIconColor = data.resultadoLiquido >= 0 ? 'text-emerald-500' : 'text-red-500'

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Receitas Operacionais"
          icon={TrendingUp}
          value={formatCurrency(data.totalReceitas)}
          valueClass="text-emerald-600"
          iconClass="text-emerald-500"
        />
        <SummaryCard
          title="Despesas Operacionais"
          icon={TrendingDown}
          value={formatCurrency(data.totalDespesas)}
          valueClass="text-red-600"
          iconClass="text-red-500"
        />
        <SummaryCard
          title="Resultado Líquido"
          icon={DollarSign}
          value={formatCurrency(data.resultadoLiquido)}
          valueClass={resultColor}
          iconClass={resultIconColor}
        />
        <SummaryCard
          title="Margem Líquida"
          icon={Activity}
          value={`${data.margemLiquida.toFixed(1)}%`}
          valueClass="text-blue-600"
          iconClass="text-blue-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estrutura do DRE</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">AV %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-muted/50 font-medium hover:bg-muted/50">
                  <TableCell>RECEITAS OPERACIONAIS</TableCell>
                  <TableCell className="text-right text-emerald-600">
                    {formatCurrency(data.totalReceitas)}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600">100.0%</TableCell>
                </TableRow>
                {data.categoriasReceitas.map((c) => (
                  <TableRow key={c.nome}>
                    <TableCell className="pl-8 text-muted-foreground">{c.nome}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.valor)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {c.percentual.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="bg-muted/50 font-medium hover:bg-muted/50">
                  <TableCell>(-) DESPESAS OPERACIONAIS</TableCell>
                  <TableCell className="text-right text-red-600">
                    {formatCurrency(data.totalDespesas)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">100.0%</TableCell>
                </TableRow>
                {data.categoriasDespesas.map((c) => (
                  <TableRow key={c.nome}>
                    <TableCell className="pl-8 text-muted-foreground">{c.nome}</TableCell>
                    <TableCell className="text-right">{formatCurrency(c.valor)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {c.percentual.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="font-bold text-base hover:bg-transparent">
                  <TableCell>(=) RESULTADO LÍQUIDO</TableCell>
                  <TableCell className={cn('text-right', resultColor)}>
                    {formatCurrency(data.resultadoLiquido)}
                  </TableCell>
                  <TableCell className="text-right text-blue-600">
                    {data.margemLiquida.toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
