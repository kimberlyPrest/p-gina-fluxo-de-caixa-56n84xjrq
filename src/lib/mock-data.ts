import { Transaction } from '@/types'
import { subDays, formatISO } from 'date-fns'

const categories = {
  RECEITA: ['Vendas', 'Consultoria', 'Rendimentos', 'Serviços'],
  DESPESA: ['Aluguel', 'Salários', 'Marketing', 'Impostos', 'Software', 'Equipamentos'],
}

const entities = {
  RECEITA: ['Tech Solutions S.A', 'Acme Corp', 'Global Logistics', 'Startup Inc', 'Retail Group'],
  DESPESA: [
    'Imobiliária Centro',
    'Google Workspace',
    'Facebook Ads',
    'Receita Federal',
    'Folha de Pgto',
    'Dell Store',
  ],
}

export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = []
  const now = new Date()

  for (let i = 0; i < 150; i++) {
    // Distribute more transactions closer to today
    const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 60)
    const type = Math.random() > 0.6 ? 'RECEITA' : 'DESPESA'

    const categoryList = categories[type]
    const entityList = entities[type]

    const amount =
      type === 'RECEITA'
        ? Math.floor(Math.random() * 15000) + 1000
        : Math.floor(Math.random() * 5000) + 100

    transactions.push({
      id: `txn-${i.toString().padStart(4, '0')}`,
      type,
      entity: entityList[Math.floor(Math.random() * entityList.length)],
      category: categoryList[Math.floor(Math.random() * categoryList.length)],
      amount,
      date: formatISO(subDays(now, daysAgo)),
    })
  }

  // Sort descending by date
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const MOCK_TRANSACTIONS = generateMockTransactions()
