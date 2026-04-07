DO $$
BEGIN
  -- Insere dados iniciais caso a tabela de movimentacoes esteja vazia para não deixar a interface em branco
  IF NOT EXISTS (SELECT 1 FROM public.movimentacoes LIMIT 1) THEN
    INSERT INTO public.categorias (id, nome, tipo) VALUES
      (gen_random_uuid(), 'Vendas', 'RECEITA'),
      (gen_random_uuid(), 'Serviços', 'RECEITA'),
      (gen_random_uuid(), 'Infraestrutura', 'DESPESA'),
      (gen_random_uuid(), 'Marketing', 'DESPESA')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.clientes_fornecedores (id, nome, documento, tipo) VALUES
      (gen_random_uuid(), 'Cliente Alpha', '11111111111', 'pessoa_fisica'),
      (gen_random_uuid(), 'Fornecedor Beta', '22222222000122', 'pessoa_juridica')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.movimentacoes (tipo, valor_realizado, data_realizado, descricao, quitado) VALUES
      ('RECEITA', 1500.00, CURRENT_DATE, 'Venda inicial (Lançamento Local)', true),
      ('DESPESA', 350.50, CURRENT_DATE - INTERVAL '2 days', 'Hospedagem de Sistemas', true),
      ('RECEITA', 4200.00, CURRENT_DATE - INTERVAL '5 days', 'Consultoria e Acompanhamento Mensal', true);
  END IF;
END $$;
