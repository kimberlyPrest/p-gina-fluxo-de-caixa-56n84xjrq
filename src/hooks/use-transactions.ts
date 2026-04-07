import { useMemo, useState, useEffect } from 'react'
import { Transaction, PeriodFilter, DateRange, SummaryData } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { isWithinInterval, startOfDay, endOfDay, subDays, subWeeks, subMonths } from 'date-fns'

export function useTransactions(
  period: PeriodFilter,
  dateRange: DateRange | undefined,
  searchTerm: string,
) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
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

      if (!error && data) {
        const mapped: Transaction[] = data.map((d: any) => ({
          id: d.id,
          type: String(d.tipo).toUpperCase() === 'RECEITA' ? 'RECEITA' : 'DESPESA',
          entity: d.clientes_fornecedores?.nome || '-',
          category: d.categorias?.nome || '-',
          amount: Number(d.valor_realizado) || 0,
          date: d.data_realizado ? `${d.data_realizado}T12:00:00Z` : new Date().toISOString(),
          status: d.quitado ? 'CONCLUÍDO' : 'PENDENTE',
        }))
        setTransactions(mapped)
      }
    }

    fetchTransactions()
  }, [])

  const filteredData = useMemo(() => {
    let filtered = transactions
    const now = new Date()

    // 1. Filter by Date
    if (period === 'custom' && dateRange?.from) {
      const from = startOfDay(dateRange.from)
      const to = endOfDay(dateRange.to || dateRange.from)
      filtered = filtered.filter((t) =>
        isWithinInterval(new Date(t.date), { start: from, end: to }),
      )
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
      filtered = filtered.filter((t) => new Date(t.date) >= fromDate)
    }

    // 2. Filter by Search Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (t) => t.entity.toLowerCase().includes(term) || t.category.toLowerCase().includes(term),
      )
    }

    return filtered
  }, [transactions, period, dateRange, searchTerm])

  const summary = useMemo<SummaryData>(() => {
    return filteredData.reduce(
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
  }, [filteredData])

  return { transactions: filteredData, summary }
}
