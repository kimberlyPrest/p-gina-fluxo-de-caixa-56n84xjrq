import { useMemo, useState, useEffect } from 'react'
import { Transaction, PeriodFilter, DateRange, SummaryData } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { format, startOfDay, subWeeks, subMonths } from 'date-fns'

export function useTransactions(
  period: PeriodFilter,
  dateRange: DateRange | undefined,
  searchTerm: string,
  empresaFilter: string = 'todas',
) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTransactions = async () => {
    setLoading(true)
    let query = supabase
      .from('movimentacoes')
      .select(`
        id,
        tipo,
        valor_realizado,
        data_realizado,
        quitado,
        clientes_fornecedores:cliente_fornecedor ( nome ),
        categorias:categoria ( nome )
      `)
      .order('data_realizado', { ascending: false })

    const now = new Date()

    if (period === 'custom' && dateRange?.from) {
      const from = format(dateRange.from, 'yyyy-MM-dd')
      const to = format(dateRange.to || dateRange.from, 'yyyy-MM-dd')
      query = query.gte('data_realizado', from).lte('data_realizado', to)
    } else if (period !== 'custom') {
      let fromDate: Date
      switch (period) {
        case 'dia':
          fromDate = startOfDay(now)
          break
        case 'semana':
          fromDate = startOfDay(subWeeks(now, 1))
          break
        case 'mes':
          fromDate = startOfDay(subMonths(now, 1))
          break
        default:
          fromDate = startOfDay(subMonths(now, 1))
      }
      query = query.gte('data_realizado', format(fromDate, 'yyyy-MM-dd'))
    }

    if (empresaFilter !== 'todas') {
      query = query.eq('empresa', empresaFilter)
    }

    const { data, error } = await query

    if (!error && data) {
      let mapped: Transaction[] = data.map((d: any) => ({
        id: d.id,
        type: String(d.tipo).toUpperCase() === 'RECEITA' ? 'RECEITA' : 'DESPESA',
        entity: d.clientes_fornecedores?.nome || '-',
        category: d.categorias?.nome || '-',
        amount: Number(d.valor_realizado) || 0,
        date: d.data_realizado ? `${d.data_realizado}T12:00:00Z` : new Date().toISOString(),
        status: d.quitado ? 'CONCLUÍDO' : 'PENDENTE',
      }))

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        mapped = mapped.filter(
          (t) => t.entity.toLowerCase().includes(term) || t.category.toLowerCase().includes(term),
        )
      }

      setTransactions(mapped)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTransactions()
  }, [period, dateRange, searchTerm, empresaFilter])

  const summary = useMemo<SummaryData>(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'RECEITA') {
          acc.receitas += curr.amount
          acc.saldo += curr.amount
        } else {
          acc.despesas += curr.amount
          acc.saldo -= curr.amount
        }
        return acc
      },
      { receitas: 0, despesas: 0, saldo: 0 },
    )
  }, [transactions])

  return { transactions, summary, loading, refetch: fetchTransactions }
}
