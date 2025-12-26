import { BarChart3, RotateCw, Plus } from 'lucide-react';
import Button from './shared/Button';
import Select from './shared/Select';
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
  const tableOptions = tables?.map(table => ({
    value: table,
    label: table
  }));

  return (
    <div className="border border-gray-300 rounded-lg p-3 sm:p-5 mb-4 sm:mb-5 bg-white">
      <h2 className="mb-3 sm:mb-4 text-sm sm:text-md font-semibold text-gray-800">
        Select the table that you would like to access (e.g. MEPs, Commissioners, ministers, etc.)
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Table Dropdown */}
        <div className="flex-1">
          <Select
            value={selectedTable}
            onChange={(e) => onTableChange(e.target.value)}
            options={tableOptions}
            placeholder="-- Select a table --"
            disabled={loading}
          />
        </div>
        
        {/* Action Buttons */}
      <div className="flex gap-2">
          {/* Refresh Button */}
        <Button
          onClick={onRefresh}
          disabled={loading}
            variant="secondary"
            icon={<RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* JOIN Button with Counter Badge */}
          <Button
            onClick={onOpenJoinModal}
            disabled={!selectedTable}
            variant="success"
            icon={<Plus className="w-4 h-4" />}
          >
            JOIN {joins.length > 0 && `(${joins.length})`}
          </Button>
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