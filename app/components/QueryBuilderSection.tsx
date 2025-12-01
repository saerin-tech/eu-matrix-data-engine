import { RuleGroupType, Field, QueryBuilder } from 'react-querybuilder';
import ColumnSelector from "./ColumnSelector";
import { Loader } from 'lucide-react';
import ExecuteButton from './ExecuteButton';
import { JoinConfig } from '../types';
import 'react-querybuilder/dist/query-builder.css';
import CustomFieldSelector from "./CustomFieldSelector";

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

const customOperators = [
  { name: "=", label: "is equal to" },
  { name: ">", label: "is higher than" },
  { name: "<", label: "is lower than" },
  { name: "contains", label: "includes the following word:" },
  { name: "does not contain", label: "doesn't include the following word:" },
  { name: "is null", label: "is empty" },
  { name: "is not null", label: "is not empty" },
];

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
    <div className="min-h-[320px] sm:min-h-[490px] border border-gray-300 rounded-lg p-3 sm:p-5 mb-4 sm:mb-5 bg-white">
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
            operators={customOperators}
            controlElements={{
            fieldSelector: CustomFieldSelector,}}
            controlClassnames={{
            ruleGroup: "min-h-[300px] sm:min-h-[400px] max-h-[300px] sm:max-h-[400px] bg-slate-800/50 p-3 sm:p-4 rounded-lg border border-slate-700 overflow-y-auto text-sm",
            removeRule: "ml-auto text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white",
            operators: "min-w-[150px] bg-slate-900 text-slate-100 border border-slate-600 rounded px-2 py-1",
            value: "bg-slate-900 text-slate-200 border border-slate-600 rounded px-2 py-1 min-w-[150px]",


          }}
            translations={{
              addRule: { label: "Add Filter" },
              addGroup: { label: "Add New Group of Filter" },
            }}
          />
        </div>
        </div>
        </div>
      )}
    </div>
  );
}