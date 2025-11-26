import { BarChart3, RotateCw } from 'lucide-react';

interface Props {
  tables: string[];
  selectedTable: string;
  fieldsCount: number;
  loading: boolean;
  onTableChange: (table: string) => void;
  onRefresh: () => void;
}

export default function TableSelector({ 
  tables, 
  selectedTable, 
  fieldsCount, 
  loading, 
  onTableChange, 
  onRefresh 
}: Props) {
  return (
    <div className="border border-gray-300 rounded-lg p-5 mb-5 bg-white">
      <h2 className="mb-4 text-md font-semibold text-gray-800">
        Select the table that you would like to access (e.g. MEPs, Commissioners, ministers, etc.)
      </h2>
      
      <div className="flex gap-2 flex-wrap">
        <select
          value={selectedTable}
          onChange={(e) => onTableChange(e.target.value)}
          disabled={loading}
          className="flex-1 min-w-[200px] p-2.5 text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a table --</option>
          {tables.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>
        
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-5 py-2.5 bg-gray-600 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {selectedTable && (
        <p className="mt-2.5 text-gray-600 text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Selected: <strong>{selectedTable}</strong> 
          {fieldsCount > 0 && ` (${fieldsCount} columns)`}
        </p>
      )}
    </div>
  );
}