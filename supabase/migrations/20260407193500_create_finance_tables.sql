CREATE TABLE IF NOT EXISTS public.clientes_fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    documento TEXT,
    tipo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    tipo TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,
    cliente_fornecedor UUID REFERENCES public.clientes_fornecedores(id) ON DELETE SET NULL,
    categoria UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    departamento TEXT,
    valor_realizado NUMERIC,
    data_realizado DATE,
    competencia DATE,
    descricao TEXT,
    quitado BOOLEAN DEFAULT FALSE,
    conciliado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_data_realizado ON public.movimentacoes(data_realizado);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_competencia ON public.movimentacoes(competencia);

ALTER TABLE public.clientes_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_clientes_fornecedores" ON public.clientes_fornecedores;
CREATE POLICY "authenticated_select_clientes_fornecedores" ON public.clientes_fornecedores FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_clientes_fornecedores" ON public.clientes_fornecedores;
CREATE POLICY "authenticated_insert_clientes_fornecedores" ON public.clientes_fornecedores FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_clientes_fornecedores" ON public.clientes_fornecedores;
CREATE POLICY "authenticated_update_clientes_fornecedores" ON public.clientes_fornecedores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_clientes_fornecedores" ON public.clientes_fornecedores;
CREATE POLICY "authenticated_delete_clientes_fornecedores" ON public.clientes_fornecedores FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_categorias" ON public.categorias;
CREATE POLICY "authenticated_select_categorias" ON public.categorias FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_categorias" ON public.categorias;
CREATE POLICY "authenticated_insert_categorias" ON public.categorias FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_categorias" ON public.categorias;
CREATE POLICY "authenticated_update_categorias" ON public.categorias FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_categorias" ON public.categorias;
CREATE POLICY "authenticated_delete_categorias" ON public.categorias FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_movimentacoes" ON public.movimentacoes;
CREATE POLICY "authenticated_select_movimentacoes" ON public.movimentacoes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_movimentacoes" ON public.movimentacoes;
CREATE POLICY "authenticated_insert_movimentacoes" ON public.movimentacoes FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_movimentacoes" ON public.movimentacoes;
CREATE POLICY "authenticated_update_movimentacoes" ON public.movimentacoes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_movimentacoes" ON public.movimentacoes;
CREATE POLICY "authenticated_delete_movimentacoes" ON public.movimentacoes FOR DELETE TO authenticated USING (true);
