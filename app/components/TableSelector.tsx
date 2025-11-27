import { BarChart3, RotateCw, Plus } from 'lucide-react';
import JoinList from './JoinList';
import { JoinConfig } from '../types';

interface Props {
  tables: string[];
  selectedTable: string;
  fieldsCount: number;
  loading: boolean;
  onTableChange: (table: string) => void;
  onRefresh: () => void;
  onOpenJoinModal: () => void;
  joins: JoinConfig[];
  onRemoveJoin: (index: number) => void;
}

export default function TableSelector({ 
  tables, 
  selectedTable, 
  fieldsCount, 
  loading, 
  onTableChange, 
  onRefresh,
  onOpenJoinModal,
  joins,
  onRemoveJoin
}: Props) {
  return (
    <div className="border border-gray-300 rounded-lg p-3 sm:p-5 mb-4 sm:mb-5 bg-white">
      <h2 className="mb-3 sm:mb-4 text-sm sm:text-md font-semibold text-gray-800">
        Select the table that you would like to access (e.g. MEPs, Commissioners, ministers, etc.)
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={selectedTable}
          onChange={(e) => onTableChange(e.target.value)}
          disabled={loading}
          className="flex-1 w-full sm:min-w-[200px] p-2.5 text-sm sm:text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a table --</option>
          {tables.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>
        
      <div className="flex gap-2">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-gray-600 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onOpenJoinModal}
            disabled={!selectedTable}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 bg-green-600 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            JOIN {joins.length > 0 && `(${joins.length})`}
          </button>
        </div>
      </div>
      
      {selectedTable && (
        <p className="mt-2.5 text-gray-600 text-xs sm:text-sm flex items-center gap-2 flex-wrap">
          <BarChart3 className="w-4 h-4" />
          <span>Selected: <strong>{selectedTable}</strong></span>
          {fieldsCount > 0 && <span>({fieldsCount} columns)</span>}
        </p>
      )}

      <JoinList 
        joins={joins} 
        selectedTable={selectedTable} 
        onRemove={onRemoveJoin} 
      />
    </div>
  );
}