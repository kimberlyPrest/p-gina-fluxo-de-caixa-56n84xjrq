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

    // Simulando chamada na API do Bom Controle (trazendo dados de Jan 2025 em diante)
    const mockBomControleData = [
      {
        tipo: 'RECEITA',
        valor: 4500.0,
        data_realizado: '2025-01-20',
        descricao: 'Serviços de Consultoria (BC)',
      },
      {
        tipo: 'DESPESA',
        valor: 120.5,
        data_realizado: '2025-01-25',
        descricao: 'Licença de Software Mensal (BC)',
      },
      {
        tipo: 'RECEITA',
        valor: 8000.0,
        data_realizado: '2025-02-15',
        descricao: 'Projeto Especial Alpha (BC)',
      },
      {
        tipo: 'DESPESA',
        valor: 350.0,
        data_realizado: '2025-03-05',
        descricao: 'Materiais de Escritório (BC)',
      },
      {
        tipo: 'RECEITA',
        valor: 1500.0,
        data_realizado: '2025-04-10',
        descricao: 'Manutenção Mensal de Servidores (BC)',
      },
    ]

    let inserted = 0
    let skipped = 0

    for (const item of mockBomControleData) {
      // Validação de duplicatas: verificar se a movimentação já existe
      const { data: existing } = await supabaseClient
        .from('movimentacoes')
        .select('id')
        .eq('descricao', item.descricao)
        .eq('data_realizado', item.data_realizado)
        .eq('valor_realizado', item.valor)
        .maybeSingle()

      if (existing) {
        skipped++
        continue
      }

      const { error } = await supabaseClient.from('movimentacoes').insert({
        tipo: item.tipo,
        valor_realizado: item.valor,
        data_realizado: item.data_realizado,
        descricao: item.descricao,
        quitado: true,
        conciliado: true,
      })

      if (error) {
        console.error('Error inserting record:', error)
      } else {
        inserted++
      }
    }

    return new Response(JSON.stringify({ success: true, inserted, skipped }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
