import { useState, useEffect } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  format,
} from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DreContent, type DreData } from '@/components/DreContent'

export default function Dre() {
  const [periodo, setPeriodo] = useState('mes')
  const [visao, setVisao] = useState('caixa')
  const [data, setData] = useState<DreData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const dateField = visao === 'competencia' ? 'competencia' : 'data_realizado'
        const now = new Date()
        let startDate, endDate

        if (periodo === 'mes') {
          startDate = format(startOfMonth(now), 'yyyy-MM-dd')
          endDate = format(endOfMonth(now), 'yyyy-MM-dd')
        } else if (periodo === 'trimestre') {
          startDate = format(startOfQuarter(now), 'yyyy-MM-dd')
          endDate = format(endOfQuarter(now), 'yyyy-MM-dd')
        } else {
          startDate = format(startOfYear(now), 'yyyy-MM-dd')
          endDate = format(endOfYear(now), 'yyyy-MM-dd')
        }

        const { data: movs, error } = await supabase
          .from('movimentacoes')
          .select(`tipo, valor_realizado, categorias(nome)`)
          .not(dateField, 'is', null)
          .gte(dateField, startDate)
          .lte(dateField, endDate)

        if (error) throw error

        const receitas = movs?.filter((m) => m.tipo === 'RECEITA') || []
        const despesas = movs?.filter((m) => m.tipo === 'DESPESA') || []

        const totalReceitas = receitas.reduce(
          (acc, curr) => acc + (Number(curr.valor_realizado) || 0),
          0,
        )
        const totalDespesas = despesas.reduce(
          (acc, curr) => acc + (Number(curr.valor_realizado) || 0),
          0,
        )
        const resultadoLiquido = totalReceitas - totalDespesas
        const margemLiquida = totalReceitas > 0 ? (resultadoLiquido / totalReceitas) * 100 : 0

        const agrupar = (items: any[], total: number) => {
          const grupos = items.reduce(
            (acc, curr) => {
              let catNome = 'Sem Categoria'
              if (curr.categorias) {
                catNome = Array.isArray(curr.categorias)
                  ? curr.categorias[0]?.nome || catNome
                  : (curr.categorias as any).nome || catNome
              }
              if (!acc[catNome]) acc[catNome] = 0
              acc[catNome] += Number(curr.valor_realizado) || 0
              return acc
            },
            {} as Record<string, number>,
          )

          return Object.entries(grupos)
            .map(([nome, valor]) => ({
              nome,
              valor: valor as number,
              percentual: total > 0 ? ((valor as number) / total) * 100 : 0,
            }))
            .sort((a, b) => b.valor - a.valor)
        }

        setData({
          totalReceitas,
          totalDespesas,
          resultadoLiquido,
          margemLiquida,
          categoriasReceitas: agrupar(receitas, totalReceitas),
          categoriasDespesas: agrupar(despesas, totalDespesas),
        })
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [visao, periodo])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Demonstrativo de Resultados (DRE)</h2>
      </div>

      <Tabs value={visao} onValueChange={setVisao} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="caixa">Por Caixa</TabsTrigger>
            <TabsTrigger value="competencia">Por Competência</TabsTrigger>
          </TabsList>

          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="trimestre">Este Trimestre</SelectItem>
              <SelectItem value="ano">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="caixa" className="mt-0">
          <DreContent data={data} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="competencia" className="mt-0">
          <DreContent data={data} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
