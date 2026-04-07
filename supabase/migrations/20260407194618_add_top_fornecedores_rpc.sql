CREATE OR REPLACE FUNCTION public.get_top_fornecedores(p_ano INT DEFAULT NULL, p_mes INT DEFAULT NULL)
RETURNS TABLE (
  fornecedor_id UUID,
  nome_fornecedor TEXT,
  total_acumulado NUMERIC,
  quantidade_transacoes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.cliente_fornecedor AS fornecedor_id,
    COALESCE(MAX(cf.nome), 'Fornecedor não informado') AS nome_fornecedor,
    SUM(m.valor_realizado) AS total_acumulado,
    COUNT(m.id) AS quantidade_transacoes
  FROM public.movimentacoes m
  LEFT JOIN public.clientes_fornecedores cf ON m.cliente_fornecedor = cf.id
  WHERE m.tipo = 'DESPESA'
    AND (p_ano IS NULL OR EXTRACT(YEAR FROM m.data_realizado::date) = p_ano)
    AND (p_mes IS NULL OR EXTRACT(MONTH FROM m.data_realizado::date) = p_mes)
  GROUP BY m.cliente_fornecedor
  ORDER BY total_acumulado DESC NULLS LAST
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
