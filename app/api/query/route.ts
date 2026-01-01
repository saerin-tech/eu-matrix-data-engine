import { NextResponse } from 'next/server';
import { createDatabaseClient } from '../../lib/database-client';

interface Rule {
  field: string;
  operator: string;
  value: any;
}

interface RuleGroup {
  combinator: "and" | "or";
  rules: (Rule | RuleGroup)[];
}

interface JoinConfig {
  type: "INNER" | "LEFT" | "RIGHT";
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
}

interface SelectedColumn {
  table: string;
  column: string;
  alias: string;
}

export async function POST(request: Request) {
  try {
    const { table, query, joins = [], selectedColumns = [], databaseId } = await request.json();

    if (!table) {
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 }
      );
    }

    // Get database client
    const supabase = await createDatabaseClient(databaseId);
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not found' },
        { status: 404 }
      );
    }

    const sqlQuery = buildSQL(table, query, joins, selectedColumns);

    // Execute query via RPC
      const { data, error } = await supabase.rpc('execute_dynamic_query', {
        p_query_text: sqlQuery,
      });

      if (error) {
        return NextResponse.json(
          {
            success: false,
            userMessage: "Query syntax error. Please check your filters.",
            devMessage: error.message,
          },
          { status: 400 }
        );
      }

    const isDebugMode = process.env.DEBUG_MODE === 'true';

      return NextResponse.json({ 
        success: true, 
        table, 
        count: data?.length || 0, 
        data, 
        hasJoins: joins.length > 0,
        sqlQuery : isDebugMode? sqlQuery : null
      });
    } catch (err: any) {
      console.error('Query execution error:', err);
      return NextResponse.json(
        {
          success: false,
          userMessage: "Internal query execution error.",
          devMessage: err.message,
        },
      { status: 500 }
    );
  }
}

function quote(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

//  FIXED: Build SQL with selected columns and aliases
function buildSQL(
  table: string,
  query: RuleGroup,
  joins: JoinConfig[],
  selectedColumns: SelectedColumn[]
): string {
  const mainAlias = "main";
  let sql = 'SELECT ';

  // Build column selection
  if (selectedColumns.length === 0) {
    sql += `${mainAlias}.*`;
    joins.forEach((_, index) => {
      sql += `, j${index}.*`;
    });
  } else {
    //  Use selected columns with aliases
    sql += selectedColumns
      ?.map((col) => {
        const tableAlias = col.table === table
          ? mainAlias 
          : `j${joins.findIndex((j) => j.targetTable === col.table)}`;
         return `${tableAlias}.${quote(col.column)} AS ${quote(col.alias)}`;
      })
      .join(', ');
  }

  // FROM clause
  sql += ` FROM ${quote(table)} AS ${mainAlias}`;

  // JOIN
  joins.forEach((join, index) => {
    const joinAlias = `j${index}`;
    sql += ` ${join.type} JOIN ${quote(join.targetTable)} AS ${joinAlias}`;
    sql += ` ON ${mainAlias}.${quote(join.sourceColumn)} = ${joinAlias}.${quote(join.targetColumn)}`;
  });

  // WHERE clause
  if (query?.rules?.length > 0) {
    const where = buildWhere(query, mainAlias, table, joins);
    if (where.trim()) {
      sql += ` WHERE ${where}`;
    }
  }

  return sql;
}

//  FIXED: Build WHERE with proper table alias resolution
function buildWhere(
  group: RuleGroup, 
  mainAlias: string, 
  mainTable: string,
  joins: JoinConfig[]
): string {
  const parts: string[] = [];

  for (const rule of group.rules) {
    if ("rules" in rule) {
      const nested = buildWhere(rule, mainAlias, mainTable, joins);
      if (nested.trim()) {
        parts.push(`(${nested})`);
      }
    } else if (rule.field && rule.operator) {
      parts.push(buildCondition(rule, mainAlias, mainTable, joins));
    }
  }

  return parts.join(` ${group.combinator.toUpperCase()} `);
}

// condition with proper alias handling
function buildCondition(
  rule: Rule,
  mainAlias: string,
  mainTable: string,
  joins: JoinConfig[]
): string {
  let field: string;
  if (rule.field.includes('.')) {
    const [tbl, col] = rule.field.split('.');
    const tableAlias = tbl === mainTable 
      ? mainAlias 
      : `j${joins.findIndex((j) => j.targetTable === tbl)}`;
    field = `${tableAlias}.${quote(col)}`;
  } else {
    field = `${mainAlias}.${quote(rule.field)}`;
  }

  //  Helper: Check if value is actually numeric
  const isNumeric = (val: any): boolean => {
    if (val === null || val === undefined || val === '') return false;
    return !isNaN(Number(val)) && !isNaN(parseFloat(String(val)));
  };

  const escapeValue = (val: any, normalize: boolean): string => {
    if (val === null || val === undefined) return 'NULL';
    if (isNumeric(val)) return String(Number(val));

    const clean = String(val).replace(/'/g, "''");
    return normalize ? `unaccent(lower('${clean}'))` : `'${clean}'`;
  };

  // Determine normalization requirements
  const isTextOperator = ['contains', 'beginsWith', 'endsWith'].includes(rule.operator);
  const shouldNormalize = isTextOperator || (!isNumeric(rule.value) && !['null', 'notNull'].includes(rule.operator));
  const normField = shouldNormalize ? `unaccent(lower(CAST(${field} AS TEXT)))` : field;

  // Build condition based on operator
  switch (rule.operator) {
    case '=':
    case '!=':
      return `${normField} ${rule.operator === '=' ? '=' : '!='} ${escapeValue(rule.value, shouldNormalize)}`;

    case '<':
    case '>':
    case '<=':
    case '>=':
      const compValue = isNumeric(rule.value) ? Number(rule.value) : `'${String(rule.value).replace(/'/g, "''")}'`;
      return `${field} ${rule.operator} ${compValue}`;
      
    case "contains":
      return `unaccent(lower(CAST(${field} AS TEXT))) LIKE unaccent(lower('%${String(rule.value).replace(/'/g, "''")}%'))`;
      
    case "beginsWith":
      return `unaccent(lower(CAST(${field} AS TEXT))) LIKE unaccent(lower('${String(rule.value).replace(/'/g, "''")}%'))`;
      
    case "endsWith":
      return `unaccent(lower(CAST(${field} AS TEXT))) LIKE unaccent(lower('%${String(rule.value).replace(/'/g, "''")}'))`;
      
    case "null":
      return `${field} IS NULL`;
      
    case "notNull":
      return `${field} IS NOT NULL`;
      
    case "in":
      const list = Array.isArray(rule.value)
        ? rule.value?.map((v) => escapeValue(v, shouldNormalize)).join(', ')
        : escapeValue(rule.value, shouldNormalize);
      return shouldNormalize 
        ? `${normField} IN (${list})`
        : `${field} IN (${list})`;
      
    default:
      return `${normField} = ${escapeValue(rule.value, shouldNormalize)}`;
  }
}