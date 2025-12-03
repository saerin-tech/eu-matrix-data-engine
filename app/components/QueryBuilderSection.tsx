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

      {loading ? (
        <p className="text-gray-600 flex items-center gap-2 text-sm">
          <Loader className="w-4 h-4 animate-spin" />
          Loading columns...
        </p>
      ) : (
        <div className='flex flex-col'>
          {/* DESKTOP ONLY: Both Headings */}
          <div className='hidden lg:flex lg:justify-between gap-3 mb-4'>
            <div className='w-[37%]'>
              <h2 className="m-0 text-base font-semibold text-gray-800">
                Select the columns...
              </h2>
            </div>
            <div className='w-[60%]'>
              <h2 className="m-0 text-base font-semibold text-gray-800">
                Select the filtering criteria
              </h2>
            </div>
          </div>

          {/* Content Wrapper */}
          <div className='flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-4'>
            {/* LEFT PANEL - Columns */}
        <div className='w-full lg:w-[37%] flex flex-col'>
              {/* MOBILE ONLY: Column Heading */}
              <h2 className="lg:hidden m-0 mb-3 text-sm font-semibold text-gray-800">
                Select the columns...
              </h2>

          <ColumnSelector
            table={selectedTable}
            joins={joins}
            onColumnsChange={onColumnsChange}
          />

              {/* DESKTOP ONLY: Execute Button (stays with columns) */}
              <div className='hidden lg:block mt-12'>
                <ExecuteButton 
                  loading={queryExecuting}
                  disabled={executeDisabled}
                  onClick={onExecuteQuery}
                />
              </div>
            </div>

            {/* RIGHT PANEL - Filters */}
        <div className='w-full lg:w-[60%]'>
          {/* MOBILE ONLY: Filter Heading */}
          <h2 className="lg:hidden m-0 mb-3 text-sm font-semibold text-gray-800">
            Select the filtering criteria
          </h2>

          <QueryBuilder 
            fields={fields} 
            query={query} 
            onQueryChange={onQueryChange}
            operators={customOperators}
            controlElements={{
            fieldSelector: CustomFieldSelector,}}
            controlClassnames={{
            ruleGroup: "min-h-[300px] lg:min-h-[400px] max-h-[300px] lg:max-h-[400px] bg-slate-800/50 p-3 lg:p-4 rounded-lg border border-slate-700 overflow-y-auto text-sm",
            removeRule: "ml-auto text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white",
            operators: "min-w-[150px] bg-slate-900 text-slate-100 border border-slate-600 rounded px-2 py-1",
            value: "bg-slate-900 text-slate-200 border border-slate-600 rounded px-2 py-1 min-w-[150px]",
          }}
            translations={{
              addRule: { label: "Add Filter" },
              addGroup: { label: "Add New Group of Filters" },
            }}
          />
        </div>
        </div>

        {/* MOBILE ONLY: Execute Button at bottom */}
        <div className='lg:hidden mt-6'>
          <ExecuteButton 
            loading={queryExecuting}
            disabled={executeDisabled}
            onClick={onExecuteQuery}
          />
        </div>
        </div>
      )}
    </div>
  );
}