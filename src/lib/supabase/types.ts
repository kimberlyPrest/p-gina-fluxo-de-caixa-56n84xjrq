// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          created_at: string | null
          id: string
          nome: string | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome?: string | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string | null
          tipo?: string
        }
        Relationships: []
      }
      clientes_fornecedores: {
        Row: {
          created_at: string | null
          documento: string | null
          id: string
          nome: string | null
          tipo: string | null
        }
        Insert: {
          created_at?: string | null
          documento?: string | null
          id?: string
          nome?: string | null
          tipo?: string | null
        }
        Update: {
          created_at?: string | null
          documento?: string | null
          id?: string
          nome?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      movimentacoes: {
        Row: {
          categoria: string | null
          cliente_fornecedor: string | null
          competencia: string | null
          conciliado: boolean | null
          created_at: string | null
          data_realizado: string | null
          departamento: string | null
          descricao: string | null
          empresa: string
          id: string
          quitado: boolean | null
          tipo: string
          valor_realizado: number | null
        }
        Insert: {
          categoria?: string | null
          cliente_fornecedor?: string | null
          competencia?: string | null
          conciliado?: boolean | null
          created_at?: string | null
          data_realizado?: string | null
          departamento?: string | null
          descricao?: string | null
          empresa?: string
          id?: string
          quitado?: boolean | null
          tipo: string
          valor_realizado?: number | null
        }
        Update: {
          categoria?: string | null
          cliente_fornecedor?: string | null
          competencia?: string | null
          conciliado?: boolean | null
          created_at?: string | null
          data_realizado?: string | null
          departamento?: string | null
          descricao?: string | null
          empresa?: string
          id?: string
          quitado?: boolean | null
          tipo?: string
          valor_realizado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'movimentacoes_categoria_fkey'
            columns: ['categoria']
            isOneToOne: false
            referencedRelation: 'categorias'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'movimentacoes_cliente_fornecedor_fkey'
            columns: ['cliente_fornecedor']
            isOneToOne: false
            referencedRelation: 'clientes_fornecedores'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_top_fornecedores: {
        Args: { p_ano?: number; p_mes?: number }
        Returns: {
          fornecedor_id: string
          nome_fornecedor: string
          quantidade_transacoes: number
          total_acumulado: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: categorias
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (nullable)
//   tipo: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: clientes_fornecedores
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (nullable)
//   documento: text (nullable)
//   tipo: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: movimentacoes
//   id: uuid (not null, default: gen_random_uuid())
//   tipo: text (not null)
//   cliente_fornecedor: uuid (nullable)
//   categoria: uuid (nullable)
//   departamento: text (nullable)
//   valor_realizado: numeric (nullable)
//   data_realizado: date (nullable)
//   competencia: date (nullable)
//   descricao: text (nullable)
//   quitado: boolean (nullable, default: false)
//   conciliado: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: now())
//   empresa: text (not null, default: 'Linhares'::text)

// --- CONSTRAINTS ---
// Table: categorias
//   PRIMARY KEY categorias_pkey: PRIMARY KEY (id)
// Table: clientes_fornecedores
//   PRIMARY KEY clientes_fornecedores_pkey: PRIMARY KEY (id)
// Table: movimentacoes
//   FOREIGN KEY movimentacoes_categoria_fkey: FOREIGN KEY (categoria) REFERENCES categorias(id) ON DELETE SET NULL
//   FOREIGN KEY movimentacoes_cliente_fornecedor_fkey: FOREIGN KEY (cliente_fornecedor) REFERENCES clientes_fornecedores(id) ON DELETE SET NULL
//   PRIMARY KEY movimentacoes_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: categorias
//   Policy "authenticated_delete_categorias" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_categorias" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_categorias" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_categorias" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: clientes_fornecedores
//   Policy "authenticated_delete_clientes_fornecedores" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_clientes_fornecedores" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_clientes_fornecedores" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_clientes_fornecedores" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: movimentacoes
//   Policy "authenticated_delete_movimentacoes" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_movimentacoes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_movimentacoes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_movimentacoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION get_top_fornecedores(integer, integer)
//   CREATE OR REPLACE FUNCTION public.get_top_fornecedores(p_ano integer DEFAULT NULL::integer, p_mes integer DEFAULT NULL::integer)
//    RETURNS TABLE(fornecedor_id uuid, nome_fornecedor text, total_acumulado numeric, quantidade_transacoes bigint)
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     RETURN QUERY
//     SELECT
//       m.cliente_fornecedor AS fornecedor_id,
//       COALESCE(MAX(cf.nome), 'Fornecedor não informado') AS nome_fornecedor,
//       SUM(m.valor_realizado) AS total_acumulado,
//       COUNT(m.id) AS quantidade_transacoes
//     FROM public.movimentacoes m
//     LEFT JOIN public.clientes_fornecedores cf ON m.cliente_fornecedor = cf.id
//     WHERE m.tipo = 'DESPESA'
//       AND (p_ano IS NULL OR EXTRACT(YEAR FROM m.data_realizado::date) = p_ano)
//       AND (p_mes IS NULL OR EXTRACT(MONTH FROM m.data_realizado::date) = p_mes)
//     GROUP BY m.cliente_fornecedor
//     ORDER BY total_acumulado DESC NULLS LAST
//     LIMIT 10;
//   END;
//   $function$
//

// --- INDEXES ---
// Table: movimentacoes
//   CREATE INDEX idx_movimentacoes_competencia ON public.movimentacoes USING btree (competencia)
//   CREATE INDEX idx_movimentacoes_data_realizado ON public.movimentacoes USING btree (data_realizado)
