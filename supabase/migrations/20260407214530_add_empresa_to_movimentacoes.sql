ALTER TABLE public.movimentacoes ADD COLUMN IF NOT EXISTS empresa TEXT NOT NULL DEFAULT 'Linhares';
