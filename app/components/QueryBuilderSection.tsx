import { RuleGroupType, Field, QueryBuilder } from 'react-querybuilder';
import ColumnSelector from "./ColumnSelector";
import { Plus, Loader } from 'lucide-react';
import JoinList from './JoinList';
import { JoinConfig } from '../types';
import 'react-querybuilder/dist/query-builder.css';

interface Props {
  fields: Field[];
  query: RuleGroupType;
  joins: JoinConfig[];
  selectedTable: string;
  loading: boolean;
  onQueryChange: (query: RuleGroupType) => void;
  onOpenJoinModal: () => void;
  onRemoveJoin: (index: number) => void;
  onColumnsChange: React.Dispatch<React.SetStateAction<{ table: string; column: string; alias: string }[]>>; 
}

export default function QueryBuilderSection({
  fields,
  query,
  joins,
  selectedTable,
  loading,
  onQueryChange,
  onOpenJoinModal,
  onRemoveJoin,
  onColumnsChange 
}: Props) {

  return (
    <div className="border min-h-[400px] max-h-[400px] border-gray-300 rounded-lg p-5 mb-5 bg-white">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="m-0 text-md font-semibold text-gray-800">
          Select the columns and filters you would like to visualise in the database
        </h2>
        <div className="flex gap-2 flex-wrap">
          {joins.length > 0 && (
            <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-bold">
              {joins.length} JOIN{joins.length > 1 ? 'S' : ''}
            </span>
          )}
          <button
            onClick={onOpenJoinModal}
            className="px-4 py-2 bg-green-600 text-white border-none rounded-md cursor-pointer text-sm font-bold hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            JOIN
          </button>
        </div>
      </div>

      <JoinList 
        joins={joins} 
        selectedTable={selectedTable} 
        onRemove={onRemoveJoin} 
      />

      {loading ? (
        <p className="text-gray-600 flex items-center gap-2">
          <Loader className="w-4 h-4 animate-spin" />
          Loading columns...
        </p>
      ) : (

        <div className='flex justify-between'>
        <div className='w-[37%]'>
          <ColumnSelector
            table={selectedTable}
            joins={joins}
            onColumnsChange={onColumnsChange}
          />
          </div>
          <div className='min-h-[300px] w-[60%]'>
          <QueryBuilder 
            fields={fields} 
            query={query} 
            onQueryChange={onQueryChange}
            controlClassnames={{
            ruleGroup: "min-h-[300px] max-h-[300px] bg-slate-800/50 p-4 rounded-lg border border-slate-700 overflow-y-auto",
          }}
            translations={{
              addRule: { label: "Add Filter" },
              addGroup: { label: "Add New Group" },
            }}
          />
        </div>
        </div>
      )}
    </div>
  );
}