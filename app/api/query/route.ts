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
  type: "INNER" |"LEFT" | "RIGHT";
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { table, query, joins = [] } = body;
    // console.log(query, "=>query");

    if (!table) {
      return NextResponse.json(
        { error: "Table name is required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const sqlQuery = buildSQL(table, query, joins);

    try {
      const { data, error } = await supabase.rpc("execute_dynamic_query", {
        query_text: sqlQuery,
      });

      if (error) {

        return NextResponse.json(
          {
            success: false,
            userMessage:
              "You have written the wrong query. Please check the syntax.",
            devMessage: error.message, // internal debugging
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, table, count: data?.length || 0, data, hasJoins: joins.length > 0 });
    } catch (err: any) {
      console.error("FATAL ERROR →", err);

      return NextResponse.json(
        {
          success: false,
          userMessage:
            "There was an issue understanding the query present in the system.",
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

  function buildSQL(table: string, query: RuleGroup, joins: JoinConfig[]): string {
  const main = q(table);

  let sql = `SELECT ${main}.*`;

  joins.forEach((j, index) => {
    const alias = `j${index}`;
    sql += `, ${q(alias)}.*`;
  });

  sql += ` FROM ${main}`;

  joins.forEach((j, index) => {
    if (!j.sourceColumn || !j.targetColumn) {
      throw new Error(`JOIN columns missing for table ${j.targetTable}`);
    }

    const joinType = j.type ? `${j.type} JOIN` : "JOIN";
    const alias = `j${index}`;

    sql += ` ${joinType} ${q(j.targetTable)} ${q(alias)}`
         + ` ON ${main}.${q(j.sourceColumn)} = ${q(alias)}.${q(j.targetColumn)}`;
  });

  if (query?.rules?.length) {
    const whereClause = buildWhere(query, table, q);
    if (whereClause.trim() !== "") {
      sql += ` WHERE ${whereClause}`;
    }
  }
// console.log(sql, "=> SQL Query")
  return sql;
}

function buildWhere(group: RuleGroup, table: string, q: (s: string) => string): string {
  const parts: string[] = [];

  for (const rule of group.rules) {
    if ("rules" in rule) {
      const nested = buildWhere(rule, table, q);
      if (nested.trim()) parts.push(`(${nested})`);
    } else if (rule.field && rule.operator) {
      parts.push(buildCondition(rule, table, q));
    }
  }

  return parts.join(` ${group.combinator.toUpperCase()} `);
}

function buildCondition(
  rule: Rule,
  defaultTable: string,
  q: (s: string) => string
): string {

  // Determine fully-qualified field with quoting
  let field: string;
  if (rule.field.includes(".")) {
    // Example: "users.name" → `"users"."name"`
    const [tbl, col] = rule.field.split(".");
    field = `${q(tbl)}.${q(col)}`;
  } else {
    // Example: name → `"mainTable"."name"`
    field = `${q(defaultTable)}.${q(rule.field)}`;
  }

  // Wrap field with unaccent+lower
  const normField = `unaccent(lower(${field}))`;

  // Escape and normalize values
  const escapeValue = (val: any) => {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "string") {
      const clean = val.replace(/'/g, "''");
      return `unaccent(lower('${clean}'))`;
    }
    return `unaccent(lower('${String(val)}'))`;
  };

  switch (rule.operator) {
    case "=":
      return `${normField} = ${escapeValue(rule.value)}`;
    case "!=":
      return `${normField} != ${escapeValue(rule.value)}`;
    case "<":
      return `${normField} < ${escapeValue(rule.value)}`;
    case ">":
      return `${normField} > ${escapeValue(rule.value)}`;
    case "<=":
      return `${normField} <= ${escapeValue(rule.value)}`;
    case ">=":
      return `${normField} >= ${escapeValue(rule.value)}`;

    // LIKE operators (case-insensitive already, but add unaccent)
    case "contains":
      return `${normField} LIKE unaccent(lower('%${String(rule.value).replace(/'/g, "''")}%'))`;

    case "beginsWith":
      return `${normField} LIKE unaccent(lower('${String(rule.value).replace(/'/g, "''")}%'))`;

    case "endsWith":
      return `${normField} LIKE unaccent(lower('%${String(rule.value).replace(/'/g, "''")}'))`;

    case "null":
      return `${field} IS NULL`;

    case "notNull":
      return `${field} IS NOT NULL`;

    case "in":
      const list = Array.isArray(rule.value)
        ? rule.value.map((v) => escapeValue(v)).join(", ")
        : escapeValue(rule.value);
      return `${normField} IN (${list})`;

    default:
      return `${normField} = ${escapeValue(rule.value)}`;
  }
}