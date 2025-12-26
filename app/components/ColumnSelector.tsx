"use client";
import { useEffect, useState } from "react";
import Input from "./shared/Input";

interface Column {
    table: string;
    column: string;
}

interface SelectedColumn {
  table: string;
  column: string;
  alias: string;
}

interface Props {
  table: string;
  joins: any[];
  databaseId?: string;
  onColumnsChange: (cols: SelectedColumn[]) => void;
}

export default function ColumnSelector({ table, joins, databaseId, onColumnsChange }: Props) {
    const [columns, setColumns] = useState<Column[]>([]);
    const [selected, setSelected] = useState<Record<string, SelectedColumn>>({});
  const [loading, setLoading] = useState(false);

  // Reload columns when table, joins, or database changes
  useEffect(() => {
    if (table) {
      loadColumns();
    } else {
      setColumns([]);
    }
          }, [table, joins, databaseId]);

        async function loadColumns() {
    setLoading(true);

        const all: Column[] = [];

    // Fetch main table columns
        const mainCols = await fetchColumnsForTable(table);
        all.push(...mainCols);

    // Fetch joined table columns
        for (const join of joins) {
            const cols = await fetchColumnsForTable(join.targetTable);
            all.push(...cols);
        }

        setColumns(all);
    setLoading(false);
  }


  async function fetchColumnsForTable(tableName: string): Promise<Column[]> {
    try {
      const response = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, databaseId }),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return (data.columns || [])?.map((col: any) => ({
        table: tableName,
        column: col.name,
      }));
    } catch (error) {
      console.error(`Failed to fetch columns for ${tableName}:`, error);
      return [];
    }
  }

  function toggleColumn(tableName: string, columnName: string) {
    const key = `${tableName}.${columnName}`;
        const updated = { ...selected };

        if (updated[key]) {
            delete updated[key];
        } else {
            updated[key] = {
        table: tableName,
        column: columnName,
        alias: `${tableName}_${columnName}`,
      };
        }

        setSelected(updated);
        onColumnsChange(Object.values(updated));
    };

  function updateAlias(tableName: string, columnName: string, alias: string) {
        const key = `${tableName}.${columnName}`;
        const updated = { ...selected };
        if (updated[key]) {
            updated[key].alias = alias;
            setSelected(updated);
            onColumnsChange(Object.values(updated));
        }
  }

  // Render states
  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-xl p-2 py-10 mt-3 border border-gray-200 min-h-[300px] max-h-[300px] flex items-center justify-center">
        <p className="text-gray-500">Loading columns...</p>
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-xl p-2 py-10 mt-3 border border-gray-200 min-h-[300px] max-h-[300px] flex items-center justify-center">
        <p className="text-gray-400">No columns available</p>
      </div>
    );
  }

    return (
        <div className="bg-white shadow-md rounded-xl p-2 py-10 mt-3 border border-gray-200 min-h-[300px] max-h-[300px] overflow-y-auto overflow-x-auto">
    <div className="flex flex-col gap-2">
        {columns?.map((col, index) => {
            const key = `${col.table}.${col.column}`;
            const selectedCol = selected[key];

            return (
                <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition h-auto min-h-[32px]"
                >
              {/* Checkbox and Column Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                            type="checkbox"
                            checked={!!selectedCol}
                            onChange={() => toggleColumn(col.table, col.column)}
                            className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-300 flex-shrink-0"
                        />
                        <span className="text-gray-700 font-medium text-sm truncate">
                            {col.table}.{col.column}
                        </span>
                    </div>

              {/* Alias Input (visible when selected) */}
                    {selectedCol && (
                        <div className="flex-shrink-0 w-52 ml-2">
                        <Input
                            value={selectedCol.alias}
                            onChange={(e) => updateAlias(col.table, col.column, e.target.value)}
                            placeholder="Alias"
                        />
                </div>
                    )}
                </div>
            );
        })}
    </div>
</div>

    );
}
