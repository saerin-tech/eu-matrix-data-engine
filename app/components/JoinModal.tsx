import { JoinConfig } from '../types';
import Button from './shared/Button';

interface Props {
  show: boolean;
  join: JoinConfig;
  tables: string[];
  selectedTable: string;
  availableColumns: {[key: string]: string[]};
  onClose: () => void;
  onJoinChange: (join: JoinConfig) => void;
  onTargetTableChange: (table: string) => void;
  onAdd: () => void;
}

export default function JoinModal({
  show,
  join,
  tables,
  selectedTable,
  availableColumns,
  onClose,
  onJoinChange,
  onTargetTableChange,
  onAdd
}: Props) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-5">
      <div className="bg-white p-8 rounded-lg w-[500px] max-w-full max-h-[90vh] overflow-y-auto">
        <h3 className="mt-0 mb-4 text-xl font-semibold text-gray-800">Configure JOIN</h3>
        
        <div className="mb-4">
          <label className="block mb-1.5 text-gray-600 text-sm font-bold">Join Type:</label>
          <select
            value={join.type}
            onChange={(e) => onJoinChange({...join, type: e.target.value as any})}
            className="w-full p-2.5 text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="INNER">INNER JOIN</option>
            <option value="LEFT">LEFT JOIN</option>
            <option value="RIGHT">RIGHT JOIN</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1.5 text-gray-600 text-sm font-bold">Target Table:</label>
          <select
            value={join.targetTable}
            onChange={(e) => onTargetTableChange(e.target.value)}
            className="w-full p-2.5 text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select table --</option>
            {tables.filter(t => t !== selectedTable)?.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1.5 text-gray-600 text-sm font-bold">
            Source Column ({selectedTable}):
          </label>
          <select
            value={join.sourceColumn}
            onChange={(e) => onJoinChange({...join, sourceColumn: e.target.value})}
            disabled={!availableColumns[selectedTable]}
            className="w-full p-2.5 text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select column --</option>
            {(availableColumns[selectedTable] || [])?.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="block mb-1.5 text-gray-600 text-sm font-bold">
            Target Column ({join.targetTable || 'select table'}):
          </label>
          <select
            value={join.targetColumn}
            onChange={(e) => onJoinChange({...join, targetColumn: e.target.value})}
            disabled={!join.targetTable || !availableColumns[join.targetTable]}
            className="w-full p-2.5 text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select column --</option>
            {(availableColumns[join.targetTable] || [])?.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            onClick={onClose}
            variant='info'
          >
            Cancel
          </Button>
          <Button
            onClick={onAdd}
            disabled={!join.targetTable || !join.sourceColumn || !join.targetColumn}
            variant='success'
          >
            Add JOIN
          </Button>
        </div>
      </div>
    </div>
  );
}
