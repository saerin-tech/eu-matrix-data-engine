import { NextResponse } from "next/server";
import { createServerClient } from "../../lib/supabase-server";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table, query, joins = [], selectedColumns = [] } = body;

    if (!table) {
      console.error("Table is missing in request body:", body); //  Debug
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const sqlQuery = buildSQL(table, query, joins, selectedColumns);
    const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE == 'true';

    try {
      const { data, error } = await supabase.rpc("execute_dynamic_query", {
        query_text: sqlQuery,
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

      return NextResponse.json({ 
        success: true, 
        table, 
        count: data?.length || 0, 
        data, 
        hasJoins: joins.length > 0,
        sqlQuery : isDebugMode? sqlQuery : null
      });
    } catch (err: any) {
      console.error("FATAL ERROR →", err);

      return NextResponse.json(
        {
          success: false,
          userMessage: "Internal query execution error.",
          devMessage: err.message,
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error", message: err.message },
      { status: 500 }
    );
  }
}

function q(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

//  FIXED: Build SQL with selected columns and aliases
function buildSQL(
  table: string,
  query: RuleGroup,
  joins: JoinConfig[],
  selectedColumns: { table: string; column: string; alias: string }[]
): string {
  const mainAlias = "main";
  const main = q(table);

  let sql = "SELECT ";

  //  If no columns selected, return all columns
  if (selectedColumns.length === 0) {
    sql += `${mainAlias}.*`;
    joins.forEach((j, index) => {
      const alias = `j${index}`;
      sql += `, ${alias}.*`;
    });
  } else {
    //  Use selected columns with aliases
    sql += selectedColumns
      .map((c) => {
        const tableAlias = c.table === table 
          ? mainAlias 
          : `j${joins.findIndex((j) => j.targetTable === c.table)}`;
        
        return `${tableAlias}.${q(c.column)} AS ${q(c.alias)}`;
      })
      .join(", ");
  }

  // FROM clause
  sql += ` FROM ${main} AS ${mainAlias}`;

  // Joins
  joins.forEach((j, index) => {
    const joinAlias = `j${index}`;
    sql += ` ${j.type} JOIN ${q(j.targetTable)} AS ${joinAlias} ON ${mainAlias}.${q(j.sourceColumn)} = ${joinAlias}.${q(j.targetColumn)}`;
  });

  // WHERE clause
  if (query && query.rules.length > 0) {
    const where = buildWhere(query, mainAlias, table, joins);
    if (where.trim()) sql += ` WHERE ${where}`;
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
      if (nested.trim()) parts.push(`(${nested})`);
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

  // Parse field (e.g., "users.name" or "name")
  if (rule.field.includes(".")) {
    const [tbl, col] = rule.field.split(".");
    
    // Determine alias
    const tableAlias = tbl === mainTable 
      ? mainAlias 
      : `j${joins.findIndex((j) => j.targetTable === tbl)}`;
    
    field = `${tableAlias}.${q(col)}`;
  } else {
    field = `${mainAlias}.${q(rule.field)}`;
  }

  //  Helper: Check if value is actually numeric
  const isNumeric = (val: any): boolean => {
    if (val === null || val === undefined || val === '') return false;
    return !isNaN(Number(val)) && !isNaN(parseFloat(String(val)));
  };

  //  Determine if we should use text operations
  const isTextOperator = ['contains', 'beginsWith', 'endsWith'].includes(rule.operator);
  const valueIsNumeric = isNumeric(rule.value);
  

  const shouldNormalize = isTextOperator || (!valueIsNumeric && rule.operator !== 'null' && rule.operator !== 'notNull');
  const normField = shouldNormalize ? `unaccent(lower(CAST(${field} AS TEXT)))` : field;


  const escapeValue = (val: any): string => {
    if (val === null || val === undefined) return "NULL";
    

    if (isNumeric(val)) {
      return String(Number(val)); 
    }
    
    if (typeof val === "string") {
      const clean = val.replace(/'/g, "''");
      return shouldNormalize ? `unaccent(lower('${clean}'))` : `'${clean}'`;
    }
    
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  switch (rule.operator) {
    case "=":
      return `${normField} = ${escapeValue(rule.value)}`;
      
    case "!=":
      return `${normField} != ${escapeValue(rule.value)}`;
      
    case "<":
    case ">":
    case "<=":
    case ">=":

      const compValue = isNumeric(rule.value) 
        ? Number(rule.value) 
        : `'${String(rule.value).replace(/'/g, "''")}'`;
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
        ? rule.value.map((v) => escapeValue(v)).join(", ")
        : escapeValue(rule.value);
      return shouldNormalize 
        ? `${normField} IN (${list})`
        : `${field} IN (${list})`;
      
    default:
      return `${normField} = ${escapeValue(rule.value)}`;
  }
}