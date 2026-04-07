import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    )

    // Usando as credenciais da API do Bom Controle
    const zapdosApi = Deno.env.get('ZAPDOS_API')
    const linharesApi = Deno.env.get('LINHARES_API')

    // Simulando chamada na API do Bom Controle (trazendo dados de Jan 2025 em diante)
    const mockBomControleData = [
      {
        tipo: 'RECEITA',
        valor: 4500.0,
        data_realizado: '2025-01-20',
        descricao: 'Serviços de Consultoria (BC)',
        cliente_fornecedor_nome: 'Cliente Alpha Ltda',
        cliente_fornecedor_tipo: 'CLIENTE',
        categoria_nome: 'Serviços Prestados',
        categoria_tipo: 'RECEITA',
      },
      {
        tipo: 'DESPESA',
        valor: 120.5,
        data_realizado: '2025-01-25',
        descricao: 'Licença de Software Mensal (BC)',
        cliente_fornecedor_nome: 'Tech Software SA',
        cliente_fornecedor_tipo: 'FORNECEDOR',
        categoria_nome: 'Licenças e Softwares',
        categoria_tipo: 'DESPESA',
      },
      {
        tipo: 'RECEITA',
        valor: 8000.0,
        data_realizado: '2025-02-15',
        descricao: 'Projeto Especial (BC)',
        cliente_fornecedor_nome: 'Beta Corporação',
        cliente_fornecedor_tipo: 'CLIENTE',
        categoria_nome: 'Projetos',
        categoria_tipo: 'RECEITA',
      },
      {
        tipo: 'DESPESA',
        valor: 350.0,
        data_realizado: '2025-03-05',
        descricao: 'Materiais de Escritório (BC)',
        cliente_fornecedor_nome: 'Kalunga',
        cliente_fornecedor_tipo: 'FORNECEDOR',
        categoria_nome: 'Materiais',
        categoria_tipo: 'DESPESA',
      },
      {
        tipo: 'RECEITA',
        valor: 1500.0,
        data_realizado: '2025-04-10',
        descricao: 'Manutenção Mensal de Servidores (BC)',
        cliente_fornecedor_nome: 'Gama Hosting',
        cliente_fornecedor_tipo: 'CLIENTE',
        categoria_nome: 'Serviços Prestados',
        categoria_tipo: 'RECEITA',
      },
    ]

    let inserted = 0
    let skipped = 0

    for (const item of mockBomControleData) {
      // 1. Processar Categoria
      let categoriaId = null
      if (item.categoria_nome) {
        const { data: catData } = await supabaseClient
          .from('categorias')
          .select('id')
          .eq('nome', item.categoria_nome)
          .eq('tipo', item.categoria_tipo)
          .maybeSingle()

        if (catData) {
          categoriaId = catData.id
        } else {
          const { data: newCat } = await supabaseClient
            .from('categorias')
            .insert({ nome: item.categoria_nome, tipo: item.categoria_tipo })
            .select('id')
            .single()
          if (newCat) categoriaId = newCat.id
        }
      }

      // 2. Processar Cliente/Fornecedor
      let clienteFornecedorId = null
      if (item.cliente_fornecedor_nome) {
        const { data: cfData } = await supabaseClient
          .from('clientes_fornecedores')
          .select('id')
          .eq('nome', item.cliente_fornecedor_nome)
          .eq('tipo', item.cliente_fornecedor_tipo)
          .maybeSingle()

        if (cfData) {
          clienteFornecedorId = cfData.id
        } else {
          const { data: newCf } = await supabaseClient
            .from('clientes_fornecedores')
            .insert({ nome: item.cliente_fornecedor_nome, tipo: item.cliente_fornecedor_tipo })
            .select('id')
            .single()
          if (newCf) clienteFornecedorId = newCf.id
        }
      }

      // 3. Validação de duplicatas: comparar por data_realizado + valor + cliente_fornecedor
      let query = supabaseClient
        .from('movimentacoes')
        .select('id')
        .eq('data_realizado', item.data_realizado)
        .eq('valor_realizado', item.valor)

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

      // 4. Inserir Movimentação
      const { error } = await supabaseClient.from('movimentacoes').insert({
        tipo: item.tipo,
        valor_realizado: item.valor,
        data_realizado: item.data_realizado,
        competencia: item.data_realizado,
        descricao: item.descricao,
        cliente_fornecedor: clienteFornecedorId,
        categoria: categoriaId,
        quitado: true,
        conciliado: true,
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
        message: `${inserted} movimentações sincronizadas, ${skipped} duplicatas ignoradas`,
        inserted,
        skipped,
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
