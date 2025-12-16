"use client";
import { useEffect, useState } from "react";
import Input from "./shared/Input";

interface Props {
    table: string;
    joins: any[];
    onColumnsChange: (cols: { table: string; column: string; alias: string }[]) => void;
}

interface Column {
    table: string;
    column: string;
}

export default function ColumnSelector({ table, joins, onColumnsChange }: Props) {
    const [columns, setColumns] = useState<Column[]>([]);
    const [selected, setSelected] = useState<Record<string, { table: string; column: string; alias: string }>>({});
                
     // Fetch columns for a specific table
        async function fetchCols(tbl: string) {
    try {
            const res = await fetch(`/api/columns`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tableName: tbl })
            });

            if (!res.ok) return [];
            const data = await res.json();
            return (data.columns || []).map((col: any) => ({
                table: tbl,
                column: col.name
            }));
    } catch (error) {
      console.error(`Failed to fetch columns for ${tbl}:`, error);
      return [];
    }
        }

  // Load columns from main table and all joined tables
        async function loadColumns() {
        const all: Column[] = [];

    // Fetch main table columns
        const mainCols = await fetchCols(table);
        all.push(...mainCols);

    // Fetch joined tables columns
        for (const j of joins) {
            const cols = await fetchCols(j.targetTable);
            all.push(...cols);
        }

        setColumns(all);
        }

  // Reload columns when table or joins change
    useEffect(() => {
    if (table) {
        loadColumns();
    }
    }, [table, joins]);

  // Toggle column selection
    const toggle = (tbl: string, col: string) => {
        const key = `${tbl}.${col}`;
        const updated = { ...selected };

        if (updated[key]) {
            delete updated[key];
        } else {
            updated[key] = { table: tbl, column: col, alias: `${tbl}_${col}` };
        }

        setSelected(updated);
        onColumnsChange(Object.values(updated));
    };

    const changeAlias = (tbl: string, col: string, value: string) => {
        const key = `${tbl}.${col}`;
        const updated = { ...selected };
        if (updated[key]) {
            updated[key].alias = value;
            setSelected(updated);
            onColumnsChange(Object.values(updated));
        }
    };

    return (
        <div className="bg-white shadow-md rounded-xl p-2 py-10 mt-3 border border-gray-200 min-h-[300px] max-h-[300px] overflow-y-auto overflow-x-auto"> 
    <div className="flex flex-col gap-2">
        {columns.map((c, i) => {
            const key = `${c.table}.${c.column}`;
            const selectedCol = selected[key];

            return (
                <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition h-auto min-h-[32px]"
                >
              {/* Column Checkbox and Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                            type="checkbox"
                            checked={!!selectedCol}
                            onChange={() => toggle(c.table, c.column)}
                            className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-300 flex-shrink-0"
                        />
                        <span className="text-gray-700 font-medium text-sm truncate">
                            {c.table}.{c.column}
                        </span>
                    </div>

              {/* Alias Input (only visible when selected) */}
                    {selectedCol && (
                        <div className="flex-shrink-0 w-52 ml-2">
                        <Input
                            value={selectedCol.alias}
                            onChange={(e) => changeAlias(c.table, c.column, e.target.value)}
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
