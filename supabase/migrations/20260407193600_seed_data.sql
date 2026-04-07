DO $$
DECLARE
  new_user_id uuid;
  cat_receita_id uuid := gen_random_uuid();
  cat_despesa_id uuid := gen_random_uuid();
  cli_id uuid := gen_random_uuid();
  forn_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kimberly@adapta.org') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'kimberly@adapta.org',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Kimberly"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  INSERT INTO public.categorias (id, nome, tipo) VALUES
  (cat_receita_id, 'Vendas de Produtos', 'receita'),
  (cat_despesa_id, 'Despesas Operacionais', 'despesa')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.clientes_fornecedores (id, nome, documento, tipo) VALUES
  (cli_id, 'Cliente Exemplo S.A.', '00.000.000/0001-00', 'pessoa_juridica'),
  (forn_id, 'Fornecedor Exemplo Ltda', '11.111.111/0001-11', 'pessoa_juridica')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.movimentacoes (tipo, cliente_fornecedor, categoria, departamento, valor_realizado, data_realizado, competencia, descricao, quitado, conciliado) VALUES
  ('receita', cli_id, cat_receita_id, 'Vendas', 15000.00, CURRENT_DATE, CURRENT_DATE, 'Venda de lote mensal', true, true),
  ('despesa', forn_id, cat_despesa_id, 'TI', 2500.00, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE, 'Pagamento de servidores', true, false),
  ('receita', cli_id, cat_receita_id, 'Vendas', 8500.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE, 'Venda avulsa', false, false),
  ('despesa', forn_id, cat_despesa_id, 'Administrativo', 1200.00, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE, 'Material de escritório', true, true);
END $$;
