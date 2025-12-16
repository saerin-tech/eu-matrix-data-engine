import { X } from 'lucide-react';
import Button from './shared/Button';
import { JoinConfig } from '../types';

interface Props {
  joins: JoinConfig[];
  selectedTable: string;
  onRemove: (index: number) => void;
}

export default function JoinList({ joins, selectedTable, onRemove }: Props) {
  if (joins.length === 0) return null;

  return (
    <div className="mt-5 flex flex-col gap-2">
      {joins.map((join, index) => (
        <div 
          key={index} 
          className="p-2 bg-blue-50 rounded-md border border-blue-200 flex justify-between items-center flex-wrap gap-2"
        >
          <span className="text-gray-800 text-sm font-mono">
            <strong className="text-blue-700">{join.type}</strong> {join.targetTable}
            <span className="text-gray-600"> ON </span>
            {selectedTable}.{join.sourceColumn} = {join.targetTable}.{join.targetColumn}
          </span>
          <Button
            onClick={() => onRemove(index)}
            variant="danger"
            size="sm"
            icon={<X className="w-3 h-3" />}
          />
        </div>
      ))}
    </div>
  );
}