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
    AND c.table_name = tbl_name
  ORDER BY c.ordinal_position;
END;
$$;

-- 4. Execute dynamic SELECT query 
CREATE OR REPLACE FUNCTION public.execute_dynamic_query(query_text text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  query_text := trim(query_text);

  -- Only allow SELECT
  IF lower(left(query_text, 6)) <> 'select' THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed';
  END IF;

  -- Prevent stacked statements
  IF query_text LIKE '%;%' THEN
    RAISE EXCEPTION 'Multiple statements not allowed';
  END IF;

  -- Block dangerous keywords
  IF query_text ~* '\b(update|delete|insert|drop|alter|grant|revoke|truncate)\b' THEN
    RAISE EXCEPTION 'Forbidden keyword in query';
  END IF;

  -- Execute safe select and return JSON rows
  RETURN QUERY EXECUTE format(
    'SELECT row_to_json(t) FROM (%s) AS t',
    query_text
  );
END;
$$;