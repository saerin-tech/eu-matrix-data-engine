import { RuleGroupType, Field, QueryBuilder } from 'react-querybuilder';
import ColumnSelector from "./ColumnSelector";
import { Loader } from 'lucide-react';
import ExecuteButton from './ExecuteButton';
import { JoinConfig } from '../types';
import 'react-querybuilder/dist/query-builder.css';

interface Props {
  fields: Field[];
  query: RuleGroupType;
  joins: JoinConfig[];
  selectedTable: string;
  loading: boolean;
  queryExecuting: boolean;
  onQueryChange: (query: RuleGroupType) => void;
  onRemoveJoin: (index: number) => void;
  onColumnsChange: React.Dispatch<React.SetStateAction<{ table: string; column: string; alias: string }[]>>;
  onExecuteQuery: () => void;
  executeDisabled: boolean;
}

export default function QueryBuilderSection({
  fields,
  query,
  joins,
  selectedTable,
  loading,
  queryExecuting,
  onQueryChange,
  onRemoveJoin,
  onColumnsChange,
  onExecuteQuery,
  executeDisabled
}: Props) {

  return (
    <div className="min-h-[300px] sm:min-h-[490px] border border-gray-300 rounded-lg p-3 sm:p-5 mb-4 sm:mb-5 bg-white">
      <div className="flex justify-between items-center mb-3 sm:mb-4 flex-wrap gap-2">
        <h2 className="m-0 text-sm sm:text-md font-semibold text-gray-800">
          Select the columns and filters you would like to visualise in the database
        </h2>
      </div>

      {loading ? (
        <p className="text-gray-600 flex items-center gap-2 text-sm">
          <Loader className="w-4 h-4 animate-spin" />
          Loading columns...
        </p>
      ) : (
        <div className='flex flex-col flex-1'>
          {/* Stacked on mobile, side-by-side on desktop */}
          <div className='flex flex-col lg:flex-row lg:justify-between gap-4'>
            {/* Column Selector + Execute Button */}
        <div className='w-full lg:w-[37%] flex flex-col'>
          <ColumnSelector
            table={selectedTable}
            joins={joins}
            onColumnsChange={onColumnsChange}
          />
              
              <div className='mt-4 sm:mt-6 lg:mt-12'>
                <ExecuteButton 
                  loading={queryExecuting}
                  disabled={executeDisabled}
                  onClick={onExecuteQuery}
                />
              </div>
            </div>
            
            {/* Query Builder */}
          <div className='w-full lg:w-[60%]'>
          <QueryBuilder 
            fields={fields} 
            query={query} 
            onQueryChange={onQueryChange}
            controlClassnames={{
            ruleGroup: "min-h-[300px] sm:min-h-[400px] max-h-[300px] sm:max-h-[400px] bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-700 overflow-y-auto text-sm",
          }}
            translations={{
              addRule: { label: "Add Filter" },
              addGroup: { label: "Add New Group" },
            }}
          />
        </div>
        </div>
        </div>
      )}
    </div>
  );
}