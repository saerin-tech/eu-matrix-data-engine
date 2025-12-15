-- 1. Get filtered search values
CREATE OR REPLACE FUNCTION public.get_filtered_search_values_text_num(
  params jsonb
)
RETURNS TABLE(val text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_name text;
  column_name text;
  search text;
BEGIN
  table_name := params->>'table_name';
  column_name := params->>'column_name';
  search := COALESCE(params->>'search', '');

  RETURN QUERY EXECUTE format(
    'SELECT DISTINCT %I::text AS val
     FROM %I
     WHERE %I::text ILIKE $1
     ORDER BY val',
    column_name,
    table_name,
    column_name
  )
  USING '%' || search || '%';
END;
$$;

-- 2. Get tables
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
  ORDER BY t.table_name;
END;
$$;

-- 3. Get table columns
CREATE OR REPLACE FUNCTION public.get_table_columns(tbl_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    (c.is_nullable = 'YES') AS is_nullable
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = tbl_name
  ORDER BY c.ordinal_position;
END;
$$;
