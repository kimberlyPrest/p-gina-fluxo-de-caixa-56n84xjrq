import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, RefreshCw, ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

interface Movimentacao {
  id: string
  tipo: string
  valor_realizado: number
  data_realizado: string
  descricao: string
  clientes_fornecedores: { nome: string } | null
  categorias: { nome: string } | null
}

export default function Index() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [ano, setAno] = useState(new Date().getFullYear().toString())
  const [mes, setMes] = useState((new Date().getMonth() + 1).toString())
  const { toast } = useToast()

  const fetchMovimentacoes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('movimentacoes')
        .select(`
          id, tipo, valor_realizado, data_realizado, descricao,
          clientes_fornecedores(nome),
          categorias(nome)
        `)
        .order('data_realizado', { ascending: false })

      if (ano !== 'todos') {
        const startDate = new Date(parseInt(ano), mes !== 'todos' ? parseInt(mes) - 1 : 0, 1)
        const endDate = new Date(parseInt(ano), mes !== 'todos' ? parseInt(mes) : 12, 0)
        query = query
          .gte('data_realizado', startDate.toISOString().split('T')[0])
          .lte('data_realizado', endDate.toISOString().split('T')[0])
      }

      const { data, error } = await query

      if (error) throw error
      setMovimentacoes(data as any)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar movimentações',
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMovimentacoes()
  }, [ano, mes])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('sync-bom-controle', {
        method: 'POST',
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      toast({
        title: 'Sincronização Concluída',
        description:
          data.message ||
          `${data.inserted} movimentações sincronizadas, ${data.skipped} duplicatas ignoradas`,
      })

      fetchMovimentacoes()
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro na sincronização',
        description: error.message,
      })
    } finally {
      setSyncing(false)
    }
  }

  const { totalReceitas, totalDespesas, saldo } = useMemo(() => {
    return movimentacoes.reduce(
      (acc, curr) => {
        const valor = curr.valor_realizado || 0
        if (curr.tipo === 'RECEITA') {
          acc.totalReceitas += valor
          acc.saldo += valor
        } else {
          acc.totalDespesas += valor
          acc.saldo -= valor
        }
        return acc
      },
      { totalReceitas: 0, totalDespesas: 0, saldo: 0 },
    )
  }, [movimentacoes])

  const anos = ['2024', '2025', '2026']
  const meses = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ]

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 animate-fade-in">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-display">Fluxo de Caixa</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sincronizar Dados
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {formatCurrency(totalReceitas)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{formatCurrency(totalDespesas)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div
              className={cn('text-2xl font-bold', saldo >= 0 ? 'text-blue-500' : 'text-red-500')}
            >
              {formatCurrency(saldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Select value={ano} onValueChange={setAno}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Anos</SelectItem>
            {anos.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={mes} onValueChange={setMes}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Meses</SelectItem>
            {meses.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cliente/Fornecedor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentacoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma movimentação encontrada para o período.
                      </TableCell>
                    </TableRow>
                  ) : (
                    movimentacoes.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>{formatDate(new Date(mov.data_realizado))}</TableCell>
                        <TableCell className="font-medium">{mov.descricao || '-'}</TableCell>
                        <TableCell>{mov.clientes_fornecedores?.nome || '-'}</TableCell>
                        <TableCell>{mov.categorias?.nome || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={mov.tipo === 'RECEITA' ? 'default' : 'destructive'}
                            className={
                              mov.tipo === 'RECEITA'
                                ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25'
                                : 'bg-red-500/15 text-red-600 hover:bg-red-500/25'
                            }
                          >
                            {mov.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-medium',
                            mov.tipo === 'RECEITA' ? 'text-emerald-600' : 'text-red-600',
                          )}
                        >
                          {mov.tipo === 'RECEITA' ? '+' : '-'}
                          {formatCurrency(mov.valor_realizado || 0)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
