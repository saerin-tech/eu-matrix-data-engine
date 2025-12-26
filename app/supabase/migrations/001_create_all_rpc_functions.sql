-- 1. Create databases storage table
CREATE TABLE IF NOT EXISTS public.add_new_databases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_name text UNIQUE NOT NULL,
  supabase_url text NOT NULL,
  supabase_anon_key text NOT NULL,
  database_url text NOT NULL,
  supabase_service_role_key text,
  is_default boolean DEFAULT false,
  is_active boolean DEFAULT true,
  connection_status text DEFAULT 'disconnected',
  last_tested_at timestamptz,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Get filtered search values for autocomplete
CREATE OR REPLACE FUNCTION public.get_filtered_search_values_text_num(
  p_table_name text,
  p_column_name text,
  p_search text DEFAULT ''
)
RETURNS TABLE(val text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_table_name IS NULL OR p_column_name IS NULL THEN
    RAISE EXCEPTION 'table_name and column_name are required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
    AND t.table_name = p_table_name
  ) THEN
    RAISE EXCEPTION 'Table "%" does not exist in public schema', p_table_name;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' 
    AND c.table_name = p_table_name
    AND c.column_name = p_column_name
  ) THEN
    RAISE EXCEPTION 'Column "%" does not exist in table "%"', p_column_name, p_table_name;
  END IF;

  RETURN QUERY EXECUTE format(
    'SELECT DISTINCT %I::text AS val
     FROM public.%I
     WHERE %I::text ILIKE $1
     ORDER BY val',
    p_column_name,
    p_table_name,
    p_column_name
  )
  USING '%' || p_search || '%';
END;
$$;

-- 3. Get tables
CREATE OR REPLACE FUNCTION public.get_tables_list()
RETURNS TABLE(table_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT t.table_name::text
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT IN ('add_new_databases')
  ORDER BY t.table_name;
END;
$$;

-- 4. Get table columns
CREATE OR REPLACE FUNCTION public.get_table_columns(p_table_name text)
RETURNS TABLE (
  column_name text,
  is_nullable boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    (c.is_nullable = 'YES') AS is_nullable
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = p_table_name
  ORDER BY c.ordinal_position;
END;
$$;

-- 5. Execute dynamic SELECT query
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE OR REPLACE FUNCTION public.execute_dynamic_query(p_query_text text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Trim whitespace
  p_query_text := trim(p_query_text);

  -- Security: Only allow SELECT
  IF lower(left(p_query_text, 6)) <> 'select' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;

  -- Security: Prevent stacked statements
  IF p_query_text LIKE '%;%' THEN
    RAISE EXCEPTION 'Multiple statements not allowed';
  END IF;

  -- Security: Block dangerous keywords
  IF p_query_text ~* '\b(update|delete|insert|drop|alter|grant|revoke|truncate|create)\b' THEN
    RAISE EXCEPTION 'Forbidden keyword in query';
  END IF;

  -- Execute query
  RETURN QUERY EXECUTE format(
    'SELECT row_to_json(t) FROM (%s) AS t',
    p_query_text
  );
END;
$$;
