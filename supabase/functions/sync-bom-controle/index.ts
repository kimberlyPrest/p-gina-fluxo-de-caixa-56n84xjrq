import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const empresa = body.empresa || 'Linhares'
    const page = body.page || 1
    const pageSize = body.pageSize || 50

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    )

    // Captura a chave de API correta baseada na empresa selecionada
    const apiKey = empresa === 'Zapdos' ? Deno.env.get('ZAPDOS_API') : Deno.env.get('LINHARES_API')

    if (!apiKey) {
      throw new Error(`API key not configured for empresa: ${empresa}`)
    }

    const params = new URLSearchParams({
      'filtro.dataInicio': '2025-01-01', // Use YYYY-MM-DD
      'filtro.dataTermino': new Date().toISOString().split('T')[0], // Use YYYY-MM-DD
      'filtro.tipoData': 'DataPagamento', // Ou DataCompetencia, conforme sua preferência
      'paginacao.itensPorPagina': pageSize.toString(),
      'paginacao.numeroDaPagina': page.toString(),
    })

    let apiData: any[] = []
    let currentPage = page
    let hasMoreData = true

    try {
      while (hasMoreData) {
        params.set('paginacao.numeroDaPagina', currentPage.toString())
        const apiUrl = `https://apinewintegracao.bomcontrole.com.br/integracao/Financeiro/PesquisaDetalhada?${params.toString()}`

        const apiResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Authorization: `ApiKey ${apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text()
          console.error(`Bom Controle API error: ${apiResponse.status} - ${errorText}`)
          throw new Error(`Bom Controle API error: ${apiResponse.status} - ${errorText}`)
        }

        const result = await apiResponse.json()
        const itens = result.Itens || []
        apiData = apiData.concat(itens)

        hasMoreData = currentPage * pageSize < (result.TotalItens || 0)
        currentPage++
      }
    } catch (fetchError: any) {
      console.error('Erro ao chamar API do Bom Controle:', fetchError.message)
      throw fetchError
    }

    let inserted = 0
    let skipped = 0

    const categoriaCache = new Map<string, string>()
    const clienteFornecedorCache = new Map<string, string>()

    for (const item of apiData) {
      // 1. Processamento de Categoria
      const categoriaNome = item.NomeCategoriaFinanceira || 'Sem Categoria'
      const categoriaTipo = item.Debito ? 'DESPESA' : 'RECEITA'

      let categoriaId = null
      if (categoriaNome) {
        const cacheKey = `${categoriaNome}-${categoriaTipo}`
        if (categoriaCache.has(cacheKey)) {
          categoriaId = categoriaCache.get(cacheKey)
        } else {
          const { data: catData } = await supabaseClient
            .from('categorias')
            .select('id')
            .eq('nome', categoriaNome)
            .eq('tipo', categoriaTipo)
            .maybeSingle()

          if (catData) {
            categoriaId = catData.id
            categoriaCache.set(cacheKey, catData.id)
          } else {
            const { data: newCat } = await supabaseClient
              .from('categorias')
              .insert({ nome: categoriaNome, tipo: categoriaTipo })
              .select('id')
              .single()
            if (newCat) {
              categoriaId = newCat.id
              categoriaCache.set(cacheKey, newCat.id)
            }
          }
        }
      }

      // 2. Processamento de Cliente/Fornecedor
      const cfNome = item.NomeClienteFornecedor || 'Não Informado'
      const cfTipo = item.Debito ? 'FORNECEDOR' : 'CLIENTE'

      let clienteFornecedorId = null
      if (cfNome && cfNome !== 'Não Informado') {
        const cacheKey = `${cfNome}-${cfTipo}`
        if (clienteFornecedorCache.has(cacheKey)) {
          clienteFornecedorId = clienteFornecedorCache.get(cacheKey)
        } else {
          const { data: cfData } = await supabaseClient
            .from('clientes_fornecedores')
            .select('id')
            .eq('nome', cfNome)
            .eq('tipo', cfTipo)
            .maybeSingle()

          if (cfData) {
            clienteFornecedorId = cfData.id
            clienteFornecedorCache.set(cacheKey, cfData.id)
          } else {
            const { data: newCf } = await supabaseClient
              .from('clientes_fornecedores')
              .insert({
                nome: cfNome,
                tipo: cfTipo,
                documento: item.DocumentoClienteFornecedor || null,
              })
              .select('id')
              .single()
            if (newCf) {
              clienteFornecedorId = newCf.id
              clienteFornecedorCache.set(cacheKey, newCf.id)
            }
          }
        }
      }

      // 3. Normalização e Validação de Dados Principais
      const dataRealizado =
        item.DataQuitacao || item.DataVencimento || new Date().toISOString().split('T')[0]
      const valorRealizado = item.Valor || 0

      // Verifica duplicidade exata para evitar recriação durante sincronizações repetidas
      let query = supabaseClient
        .from('movimentacoes')
        .select('id')
        .eq('data_realizado', dataRealizado)
        .eq('valor_realizado', valorRealizado)
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

      // Normalização de Tipo
      const finalTipo = item.Debito ? 'DESPESA' : 'RECEITA'

      // 4. Inserção do Registro
      const { error } = await supabaseClient.from('movimentacoes').insert({
        tipo: finalTipo,
        valor_realizado: valorRealizado,
        data_realizado: dataRealizado,
        competencia: item.DataCompetencia || dataRealizado,
        descricao: item.Nome || 'Sincronizado do Bom Controle',
        cliente_fornecedor: clienteFornecedorId,
        categoria: categoriaId,
        quitado: item.DataQuitacao ? true : false,
        conciliado: item.DataConciliacao ? true : false,
        empresa: empresa, // ✅ SEPARA AS EMPRESAS
      })

      if (error) {
        console.error('Error inserting record:', error)
      } else {
        inserted++
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${inserted} movimentações sincronizadas, ${skipped} ignoradas na empresa ${empresa}.`,
        inserted,
        skipped,
        hasMore: false,
        page: currentPage,
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
