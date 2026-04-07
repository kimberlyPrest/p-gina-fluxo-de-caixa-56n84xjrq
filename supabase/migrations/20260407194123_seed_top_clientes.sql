DO $$
DECLARE
  c1 UUID := gen_random_uuid();
  c2 UUID := gen_random_uuid();
  c3 UUID := gen_random_uuid();
  c4 UUID := gen_random_uuid();
  c5 UUID := gen_random_uuid();
BEGIN
  -- Cria clientes para popular o dashboard de Top Clientes
  INSERT INTO public.clientes_fornecedores (id, nome, tipo) VALUES
    (c1, 'Tech Solutions S.A.', 'pessoa_juridica'),
    (c2, 'Empresa Alpha Ltda', 'pessoa_juridica'),
    (c3, 'Consultoria Beta', 'pessoa_juridica'),
    (c4, 'João Silva', 'pessoa_fisica'),
    (c5, 'Maria Oliveira', 'pessoa_fisica')
  ON CONFLICT (id) DO NOTHING;

  -- Relaciona clientes com novas movimentacoes de receita
  INSERT INTO public.movimentacoes (id, tipo, cliente_fornecedor, valor_realizado, data_realizado, descricao, quitado, conciliado) VALUES
    (gen_random_uuid(), 'RECEITA', c1, 25000.00, '2025-01-20', 'Consultoria Tech', true, true),
    (gen_random_uuid(), 'RECEITA', c1, 12000.00, '2025-04-10', 'Licenças Tech', true, true),
    (gen_random_uuid(), 'RECEITA', c2, 15000.00, '2025-01-15', 'Projeto Sistema Web', true, true),
    (gen_random_uuid(), 'RECEITA', c2, 5000.00, '2025-02-10', 'Manutenção Alpha', true, true),
    (gen_random_uuid(), 'RECEITA', c3, 8000.00, '2025-03-05', 'Auditoria Beta', true, true),
    (gen_random_uuid(), 'RECEITA', c4, 3000.00, '2025-02-25', 'Serviço João', true, true),
    (gen_random_uuid(), 'RECEITA', c5, 4500.00, '2025-04-01', 'Design Maria', true, true)
  ON CONFLICT DO NOTHING;
END $$;
