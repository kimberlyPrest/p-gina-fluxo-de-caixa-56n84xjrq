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

const ITEMS_PER_PAGE = 10

const Index = () => {
  const [period, setPeriod] = useState<PeriodFilter>('mes')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { transactions, summary } = useTransactions(period, dateRange, search)

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
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Fluxo de Caixa</h2>
        <p className="text-muted-foreground">Acompanhe suas receitas e despesas em tempo real.</p>
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
      <div className="hidden md:block mb-6">
        <TransactionTable transactions={paginatedData} />
      </div>

      {/* Mobile View */}
      <div className="md:hidden mb-6">
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
