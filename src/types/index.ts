export type TransactionType = 'RECEITA' | 'DESPESA'

export interface Transaction {
  id: string
  type: TransactionType
  entity: string // Cliente or Fornecedor
  category: string
  amount: number
  date: string // ISO string
}

export type PeriodFilter = 'dia' | 'semana' | 'mes' | 'custom'

export interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

export interface SummaryData {
  receitas: number
  despesas: number
  saldo: number
}
