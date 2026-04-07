import { useState } from 'react'
import { useTransactions } from '@/hooks/use-transactions'
import { PeriodFilter, DateRange } from '@/types'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { DashboardFilters } from '@/components/dashboard/DashboardFilters'
import { TransactionTable } from '@/components/dashboard/TransactionTable'
import { TransactionList } from '@/components/dashboard/TransactionList'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

const ITEMS_PER_PAGE = 10

const Index = () => {
  const [period, setPeriod] = useState<PeriodFilter>('mes')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { transactions, summary, loading, refetch } = useTransactions(period, dateRange, search)
  const { toast } = useToast()
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('sync-bom-controle', {
        method: 'POST',
      })
      if (error) throw error

      toast({
        title: 'Sincronização concluída',
        description: `${data.inserted} novos registros adicionados, ${data.skipped} já existentes ignorados.`,
      })
      refetch()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro na sincronização',
        description: err.message || 'Falha ao sincronizar dados do Bom Controle',
      })
    } finally {
      setSyncing(false)
    }
  }

  // Reset page when filters change
  const handleSetPeriod = (p: PeriodFilter) => {
    setPeriod(p)
    setPage(1)
  }
  const handleSetDateRange = (d: DateRange | undefined) => {
    setDateRange(d)
    setPage(1)
  }
  const handleSetSearch = (s: string) => {
    setSearch(s)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE))
  const paginatedData = transactions.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="flex flex-col w-full pb-10">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Fluxo de Caixa</h2>
          <p className="text-muted-foreground">Acompanhe suas receitas e despesas em tempo real.</p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing || loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-elevation transition-all"
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', syncing && 'animate-spin')} />
          Sincronizar Bom Controle
        </Button>
      </div>

      <SummaryCards data={summary} />

      <DashboardFilters
        period={period}
        setPeriod={handleSetPeriod}
        dateRange={dateRange}
        setDateRange={handleSetDateRange}
        search={search}
        setSearch={handleSetSearch}
      />

      {/* Desktop View */}
      <div className={cn('hidden md:block mb-6 transition-opacity', loading && 'opacity-50')}>
        <TransactionTable transactions={paginatedData} />
      </div>

      {/* Mobile View */}
      <div className={cn('md:hidden mb-6 transition-opacity', loading && 'opacity-50')}>
        <TransactionList transactions={paginatedData} />
      </div>

      {/* Pagination */}
      {transactions.length > ITEMS_PER_PAGE && (
        <Pagination className="mt-8 animate-fade-in">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.max(1, p - 1))
                }}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            <PaginationItem className="hidden sm:block">
              <span className="text-sm text-muted-foreground px-4">
                Página {page} de {totalPages}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setPage((p) => Math.min(totalPages, p + 1))
                }}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default Index
