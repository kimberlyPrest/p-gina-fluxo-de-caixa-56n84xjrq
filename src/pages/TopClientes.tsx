import { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { supabase } from '@/lib/supabase/client'
import { Users } from 'lucide-react'

export default function TopClientes() {
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [month, setMonth] = useState('all')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [year, month])

  const fetchData = async () => {
    setLoading(true)
    let query = supabase
      .from('movimentacoes')
      .select(`
        valor_realizado,
        data_realizado,
        clientes_fornecedores (
          nome
        )
      `)
      .eq('tipo', 'RECEITA')

    if (year !== 'all') {
      const startDate = `${year}-${month === 'all' ? '01' : month}-01`
      const endMonth = month === 'all' ? 12 : parseInt(month)
      const endDay = new Date(parseInt(year), endMonth, 0).getDate()
      const endDate = `${year}-${month === 'all' ? '12' : month.padStart(2, '0')}-${endDay}`
      query = query.gte('data_realizado', startDate).lte('data_realizado', endDate)
    }

    const { data: movs, error } = await query

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const clientMap = new Map<string, { nome: string; total: number; qtd: number }>()

    movs?.forEach((m) => {
      const val = Number(m.valor_realizado || 0)
      const nome = (m.clientes_fornecedores as any)?.nome || 'Cliente Não Identificado'

      const existing = clientMap.get(nome)
      if (existing) {
        existing.total += val
        existing.qtd += 1
      } else {
        clientMap.set(nome, { nome, total: val, qtd: 1 })
      }
    })

    const aggregated = Array.from(clientMap.values()).sort((a, b) => b.total - a.total)
    setData(aggregated)
    setLoading(false)
  }

  const top10 = useMemo(() => data.slice(0, 10), [data])
  const top5Data = useMemo(() => data.slice(0, 5), [data])

  const chartConfig = {
    total: {
      label: 'Receita',
      color: '#FF6B00',
    },
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2 text-primary">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-display text-foreground">
            Top Clientes
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Meses</SelectItem>
              <SelectItem value="01">Janeiro</SelectItem>
              <SelectItem value="02">Fevereiro</SelectItem>
              <SelectItem value="03">Março</SelectItem>
              <SelectItem value="04">Abril</SelectItem>
              <SelectItem value="05">Maio</SelectItem>
              <SelectItem value="06">Junho</SelectItem>
              <SelectItem value="07">Julho</SelectItem>
              <SelectItem value="08">Agosto</SelectItem>
              <SelectItem value="09">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="font-display">Ranking de Receitas (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="w-[80px]">Posição</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Transações</TableHead>
                  <TableHead className="text-right">Total Acumulado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      Carregando dados...
                    </TableCell>
                  </TableRow>
                ) : top10.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      Nenhum dado encontrado para o período selecionado.
                    </TableCell>
                  </TableRow>
                ) : (
                  top10.map((item, index) => (
                    <TableRow key={item.nome} className="border-border/50">
                      <TableCell className="font-medium">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.qtd}</TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.total)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/50 shadow-md">
          <CardHeader>
            <CardTitle className="font-display">Top 5 - Visão Gráfica</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                Carregando gráfico...
              </div>
            ) : top5Data.length === 0 ? (
              <div className="flex h-[350px] items-center justify-center text-muted-foreground">
                Sem dados suficientes
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <BarChart
                  data={top5Data}
                  layout="vertical"
                  margin={{ top: 10, right: 60, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    horizontal={false}
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="nome"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    width={100}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[0, 4, 4, 0]} barSize={28}>
                    <LabelList
                      dataKey="total"
                      position="right"
                      formatter={(val: number) =>
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        }).format(val)
                      }
                      fill="hsl(var(--foreground))"
                      fontSize={11}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
