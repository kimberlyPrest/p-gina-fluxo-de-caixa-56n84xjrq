import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const empresa = body.empresa || 'Linhares'
    const page = body.page || 1
    const pageSize = 50 // Lotes menores para processar em etapas sem estourar limites

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    )

    // Simulando chamada na API do Bom Controle paginada (trazendo todos os dados de Jan 2025 até hoje)
    const startDate = new Date('2025-01-01T12:00:00Z')
    const endDate = new Date() // Hoje

    // Calcula total de dias para mockar registros (1 por dia por empresa)
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalRecords = Math.max(totalDays + 1, 1)

    const startIndex = (page - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalRecords)

    const mockBomControleData: any[] = []

    const templatesLinhares = [
      {
        tipo: 'RECEITA',
        valor: 4500.0,
        descricao: 'Serviços de Consultoria (BC)',
        cf_nome: 'Cliente Alpha Ltda',
        cf_tipo: 'CLIENTE',
        cat_nome: 'Serviços Prestados',
        cat_tipo: 'RECEITA',
      },
      {
        tipo: 'DESPESA',
        valor: 120.5,
        descricao: 'Licença de Software Mensal (BC)',
        cf_nome: 'Tech Software SA',
        cf_tipo: 'FORNECEDOR',
        cat_nome: 'Licenças e Softwares',
        cat_tipo: 'DESPESA',
      },
      {
        tipo: 'RECEITA',
        valor: 1500.0,
        descricao: 'Manutenção Mensal de Servidores (BC)',
        cf_nome: 'Gama Hosting',
        cf_tipo: 'CLIENTE',
        cat_nome: 'Serviços Prestados',
        cat_tipo: 'RECEITA',
      },
      {
        tipo: 'DESPESA',
        valor: 2000.0,
        descricao: 'Aluguel Escritório (BC)',
        cf_nome: 'Imobiliária Central',
        cf_tipo: 'FORNECEDOR',
        cat_nome: 'Infraestrutura',
        cat_tipo: 'DESPESA',
      },
    ]

    const templatesZapdos = [
      {
        tipo: 'RECEITA',
        valor: 8000.0,
        descricao: 'Projeto Especial (BC)',
        cf_nome: 'Beta Corporação',
        cf_tipo: 'CLIENTE',
        cat_nome: 'Projetos',
        cat_tipo: 'RECEITA',
      },
      {
        tipo: 'DESPESA',
        valor: 350.0,
        descricao: 'Materiais de Escritório (BC)',
        cf_nome: 'Kalunga',
        cf_tipo: 'FORNECEDOR',
        cat_nome: 'Materiais',
        cat_tipo: 'DESPESA',
      },
      {
        tipo: 'DESPESA',
        valor: 800.0,
        descricao: 'Marketing Ads (BC)',
        cf_nome: 'Google Brasil',
        cf_tipo: 'FORNECEDOR',
        cat_nome: 'Marketing',
        cat_tipo: 'DESPESA',
      },
      {
        tipo: 'RECEITA',
        valor: 3200.0,
        descricao: 'Venda de Licenças (BC)',
        cf_nome: 'Empresa Delta',
        cf_tipo: 'CLIENTE',
        cat_nome: 'Vendas',
        cat_tipo: 'RECEITA',
      },
    ]

    const templates = empresa === 'Zapdos' ? templatesZapdos : templatesLinhares

    for (let i = startIndex; i < endIndex; i++) {
      const template = templates[i % templates.length]

      const currentDate = new Date(startDate)
      currentDate.setDate(currentDate.getDate() + i)

      mockBomControleData.push({
        tipo: template.tipo,
        valor: template.valor + ((i * 10) % 100), // Variar o valor para simular registros diferentes
        data_realizado: currentDate.toISOString().split('T')[0],
        descricao: template.descricao,
        cliente_fornecedor_nome: template.cf_nome,
        cliente_fornecedor_tipo: template.cf_tipo,
        categoria_nome: template.cat_nome,
        categoria_tipo: template.cat_tipo,
      })
    }

    let inserted = 0
    let skipped = 0

    const categoriaCache = new Map<string, string>()
    const clienteFornecedorCache = new Map<string, string>()

    for (const item of mockBomControleData) {
      let categoriaId = null
      if (item.categoria_nome) {
        const cacheKey = `${item.categoria_nome}-${item.categoria_tipo}`
        if (categoriaCache.has(cacheKey)) {
          categoriaId = categoriaCache.get(cacheKey)
        } else {
          const { data: catData } = await supabaseClient
            .from('categorias')
            .select('id')
            .eq('nome', item.categoria_nome)
            .eq('tipo', item.categoria_tipo)
            .maybeSingle()

          if (catData) {
            categoriaId = catData.id
            categoriaCache.set(cacheKey, catData.id)
          } else {
            const { data: newCat } = await supabaseClient
              .from('categorias')
              .insert({ nome: item.categoria_nome, tipo: item.categoria_tipo })
              .select('id')
              .single()
            if (newCat) {
              categoriaId = newCat.id
              categoriaCache.set(cacheKey, newCat.id)
            }
          }
        }
      }

      let clienteFornecedorId = null
      if (item.cliente_fornecedor_nome) {
        const cacheKey = `${item.cliente_fornecedor_nome}-${item.cliente_fornecedor_tipo}`
        if (clienteFornecedorCache.has(cacheKey)) {
          clienteFornecedorId = clienteFornecedorCache.get(cacheKey)
        } else {
          const { data: cfData } = await supabaseClient
            .from('clientes_fornecedores')
            .select('id')
            .eq('nome', item.cliente_fornecedor_nome)
            .eq('tipo', item.cliente_fornecedor_tipo)
            .maybeSingle()

          if (cfData) {
            clienteFornecedorId = cfData.id
            clienteFornecedorCache.set(cacheKey, cfData.id)
          } else {
            const { data: newCf } = await supabaseClient
              .from('clientes_fornecedores')
              .insert({ nome: item.cliente_fornecedor_nome, tipo: item.cliente_fornecedor_tipo })
              .select('id')
              .single()
            if (newCf) {
              clienteFornecedorId = newCf.id
              clienteFornecedorCache.set(cacheKey, newCf.id)
            }
          }
        }
      }

      let query = supabaseClient
        .from('movimentacoes')
        .select('id')
        .eq('data_realizado', item.data_realizado)
        .eq('valor_realizado', item.valor)
        .eq('empresa', empresa)

      if (clienteFornecedorId) {
        query = query.eq('cliente_fornecedor', clienteFornecedorId)
      } else {
        query = query.is('cliente_fornecedor', null)
      }

      const { data: existing } = await query.maybeSingle()

      if (existing) {
        skipped++
        continue
      }

      const tipoNormalized = String(item.tipo || '')
        .toUpperCase()
        .trim()
      const isReceita =
        tipoNormalized === 'RECEITA' ||
        tipoNormalized === 'RECEITAS' ||
        tipoNormalized.includes('RECEITA')
      const finalTipo = isReceita ? 'RECEITA' : 'DESPESA'

      const { error } = await supabaseClient.from('movimentacoes').insert({
        tipo: finalTipo,
        valor_realizado: item.valor,
        data_realizado: item.data_realizado,
        competencia: item.data_realizado,
        descricao: item.descricao,
        cliente_fornecedor: clienteFornecedorId,
        categoria: categoriaId,
        quitado: true,
        conciliado: true,
        empresa: empresa,
      })

      if (error) {
        console.error('Error inserting record:', error)
      } else {
        inserted++
      }
    }

    const hasMore = endIndex < totalRecords

    return new Response(
      JSON.stringify({
        success: true,
        message: `${inserted} movimentações sincronizadas, ${skipped} ignoradas.`,
        inserted,
        skipped,
        hasMore,
        page,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
