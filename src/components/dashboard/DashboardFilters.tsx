import { DateRange, PeriodFilter } from '@/types'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Building2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DashboardFiltersProps {
  period: PeriodFilter
  setPeriod: (p: PeriodFilter) => void
  dateRange: DateRange | undefined
  setDateRange: (d: DateRange | undefined) => void
  search: string
  setSearch: (s: string) => void
  empresa?: string
  setEmpresa?: (e: string) => void
}

export function DashboardFilters({
  period,
  setPeriod,
  dateRange,
  setDateRange,
  search,
  setSearch,
}: DashboardFiltersProps) {
  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range)
    if (range?.from) {
      setPeriod('custom')
    }
  }

  const handlePeriodChange = (val: string) => {
    setPeriod(val as PeriodFilter)
    if (val !== 'custom') {
      setDateRange(undefined)
    }
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between mb-6 animate-fade-in">
      <Tabs value={period} onValueChange={handlePeriodChange} className="w-full xl:w-auto">
        <TabsList className="bg-card border border-border h-11 w-full xl:w-auto">
          <TabsTrigger
            value="dia"
            className="font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Dia
          </TabsTrigger>
          <TabsTrigger
            value="semana"
            className="font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Semana
          </TabsTrigger>
          <TabsTrigger
            value="mes"
            className="font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Mês
          </TabsTrigger>
          <TabsTrigger value="custom" disabled className="hidden xl:flex">
            Personalizado
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto flex-1 xl:flex-none">
        {setEmpresa && (
          <div className="w-full sm:w-[180px]">
            <Select value={empresa || 'todas'} onValueChange={setEmpresa}>
              <SelectTrigger className="h-10 bg-card border-border focus-visible:ring-primary">
                <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Empresas</SelectItem>
                <SelectItem value="Linhares">Linhares</SelectItem>
                <SelectItem value="Zapdos">Zapdos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="w-full sm:w-[260px]">
          <DatePickerWithRange date={dateRange} setDate={handleDateChange} />
        </div>

        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar cliente ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border h-10 focus-visible:ring-primary"
          />
        </div>
      </div>
    </div>
  )
}
