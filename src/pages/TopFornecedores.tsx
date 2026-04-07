import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Truck, Loader2 } from 'lucide-react'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default function TopFornecedores() {
  const currentYear = new Date().getFullYear().toString()
  const currentMonth = (new Date().getMonth() + 1).toString()

  const [year, setYear] = useState<string>(currentYear)
  const [month, setMonth] = useState<string>(currentMonth)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)

    const { data: rpcData, error: rpcError } = await supabase.rpc('get_top_fornecedores', {
      p_ano: year === 'all' ? null : parseInt(year),
      p_mes: month === 'all' ? null : parseInt(month),
    })

    if (!rpcError && rpcData) {
      setData(rpcData)
      setLoading(false)
      return
    }

    let query = supabase
      .from('movimentacoes')
      .select('valor_realizado, data_realizado, cliente_fornecedor, clientes_fornecedores(nome)')
      .eq('tipo', 'DESPESA')

    if (year !== 'all') {
      const start = `${year}-01-01`
      const end = `${year}-12-31`
      if (month !== 'all') {
        const paddedMonth = month.padStart(2, '0')
        const startDate = `${year}-${paddedMonth}-01`
        const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1
        const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year)
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`
        query = query.gte('data_realizado', startDate).lt('data_realizado', endDate)
      } else {
        query = query.gte('data_realizado', start).lte('data_realizado', end)
      }
    }

    const { data: movs, error } = await query

    if (error || !movs) {
      setData([])
      setLoading(false)
      return
    }

    const grouped = movs.reduce(
      (acc, curr) => {
        const id = curr.cliente_fornecedor || 'unknown'
        const nome = (curr.clientes_fornecedores as any)?.nome || 'Fornecedor não informado'
        if (!acc[id]) {
          acc[id] = {
            fornecedor_id: id,
            nome_fornecedor: nome,
            total_acumulado: 0,
            quantidade_transacoes: 0,
          }
        }
        acc[id].total_acumulado += Number(curr.valor_realizado || 0)
        acc[id].quantidade_transacoes += 1
        return acc
      },
      {} as Record<string, any>,
    )

    const sorted = Object.values(grouped)
      .sort((a: any, b: any) => b.total_acumulado - a.total_acumulado)
      .slice(0, 10)
    setData(sorted)
    setLoading(false)
  }, [year, month])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const chartConfig = {
    total: {
      label: 'Total Acumulado',
      color: '#FF3B3B',
    },
  }

  const top5 = data.slice(0, 5)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-8 w-8 text-[#FF3B3B]" />
            Top Fornecedores
          </h2>
          <p className="text-muted-foreground">
            Acompanhe os fornecedores que mais geraram despesas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Anos</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Meses</SelectItem>
              <SelectItem value="1">Janeiro</SelectItem>
              <SelectItem value="2">Fevereiro</SelectItem>
              <SelectItem value="3">Março</SelectItem>
              <SelectItem value="4">Abril</SelectItem>
              <SelectItem value="5">Maio</SelectItem>
              <SelectItem value="6">Junho</SelectItem>
              <SelectItem value="7">Julho</SelectItem>
              <SelectItem value="8">Agosto</SelectItem>
              <SelectItem value="9">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Top 5 Fornecedores</CardTitle>
            <CardDescription>Visualização dos maiores gastos acumulados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : data.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma despesa encontrada para o período.
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  data={top5}
                  layout="vertical"
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis
                    dataKey="nome_fornecedor"
                    type="category"
                    width={150}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'transparent' }}
                    content={
                      <ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />
                    }
                  />
                  <Bar
                    dataKey="total_acumulado"
                    fill="var(--color-total)"
                    radius={[0, 4, 4, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Ranking Detalhado</CardTitle>
            <CardDescription>Top 10 fornecedores por volume de despesas</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : data.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível.
              </div>
            ) : (
              <div className="overflow-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Posição</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead className="text-right">Transações</TableHead>
                      <TableHead className="text-right">Total Acumulado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={item.fornecedor_id || index}>
                        <TableCell className="font-medium text-muted-foreground">
                          #{index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{item.nome_fornecedor}</TableCell>
                        <TableCell className="text-right">{item.quantidade_transacoes}</TableCell>
                        <TableCell className="text-right font-bold text-[#FF3B3B]">
                          {formatCurrency(item.total_acumulado)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
