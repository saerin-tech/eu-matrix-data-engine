"use client"
import { useState, useEffect } from 'react';
import { QueryBuilder, RuleGroupType, formatQuery, Field } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { supabase } from './lib/supabase';
import Pagination from './components/Pagination';
import { CheckCircle2, XCircle, RotateCw, Loader, BarChart3, Search, Send, AlertCircle, Plus, X } from 'lucide-react';


const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [],
};

interface JoinConfig {
  type: 'INNER' | 'LEFT' | 'RIGHT';
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
}

export default function Home() {
  const [query, setQuery] = useState<RuleGroupType>(initialQuery);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [fields, setFields] = useState<Field[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);
  
  const [joins, setJoins] = useState<JoinConfig[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newJoin, setNewJoin] = useState<JoinConfig>({
    type: 'INNER',
    targetTable: '',
    sourceColumn: '',
    targetColumn: ''
  });
  const [availableColumns, setAvailableColumns] = useState<{[key: string]: string[]}>({});
  const [sendingToBackend, setSendingToBackend] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      loadTables();
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (selectedTable && selectedTable.trim() !== '') {
      loadTableColumns(selectedTable);
    } else {
      setFields([]);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable && joins.length > 0) {
      loadAllFieldsWithJoins();
    }
  }, [joins]);

  async function checkConnection() {
    try {
      if (supabase) {
        setConnectionStatus('connected');
        console.log('Supabase connection successful!');
      } else {
        throw new Error('Supabase client not initialized');
      }
    } catch (err) {
      setConnectionStatus('error');
      console.error('Connection failed:', err);
    }
  }

  async function loadTables() {
    setLoadingTables(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('get_tables_list');
      if (error) throw error;
      const tableNames = data?.map((t: any) => t.table_name || t) || [];
      setTables(tableNames);
      console.log('Tables loaded:', tableNames);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Please create RPC function in Supabase SQL Editor first!');
    } finally {
      setLoadingTables(false);
    }
  }

  async function loadTableColumns(tableName: string) {
    setLoadingColumns(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('get_table_columns', { table_name: tableName });
      if (error) throw error;
      
      const columnNames = data?.map((col: any) => col.column_name) || [];
      setAvailableColumns(prev => ({ ...prev, [tableName]: columnNames }));
      
      const newFields: Field[] = data?.map((col: any) => ({
        name: `${tableName}.${col.column_name}`,
        label: `${tableName}.${col.column_name}`,
        inputType: mapPostgresType(col.data_type),
      })) || [];
      
      setFields(newFields);
      console.log('Columns loaded:', newFields);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Could not load columns. Make sure RPC function exists.');
    } finally {
      setLoadingColumns(false);
    }
  }

  async function loadAllFieldsWithJoins() {
    setLoadingColumns(true);
    
    try {
      const mainFields = await loadFieldsForTable(selectedTable);
      const joinedFields = await Promise.all(
        joins.map(join => loadFieldsForTable(join.targetTable))
      );
      
      const allFields = [...mainFields, ...joinedFields.flat()];
      setFields(allFields);
      console.log('All fields loaded with joins:', allFields);
    } catch (err: any) {
      console.error('Error loading joined fields:', err);
    } finally {
      setLoadingColumns(false);
    }
  }

  async function loadFieldsForTable(tableName: string): Promise<Field[]> {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: tableName });
    if (error || !data) return [];
    
    const columnNames = data.map((col: any) => col.column_name);
    setAvailableColumns(prev => ({ ...prev, [tableName]: columnNames }));
    
    return data.map((col: any) => ({
      name: `${tableName}.${col.column_name}`,
      label: `${tableName}.${col.column_name}`,
      inputType: mapPostgresType(col.data_type),
    }));
  }
  
  function mapPostgresType(pgType: string): string {
    const map: { [key: string]: string } = {
      'integer': 'number', 'bigint': 'number', 'int8': 'number', 'int4': 'number',
      'numeric': 'number', 'real': 'number', 'double precision': 'number',
      'boolean': 'checkbox', 'date': 'date', 'timestamp': 'datetime-local',
      'timestamptz': 'datetime-local', 'time': 'time',
    };
    return map[pgType.toLowerCase()] || 'text';
  }

  async function openJoinModal() {
    setShowJoinModal(true);
    if (!availableColumns[selectedTable]) {
      await loadTableColumns(selectedTable);
    }
  }

  async function onTargetTableChange(tableName: string) {
    setNewJoin({...newJoin, targetTable: tableName, sourceColumn: '', targetColumn: ''});
    if (tableName && !availableColumns[tableName]) {
      const { data } = await supabase.rpc('get_table_columns', { table_name: tableName });
      if (data) {
        const columnNames = data.map((col: any) => col.column_name);
        setAvailableColumns(prev => ({ ...prev, [tableName]: columnNames }));
      }
    }
  }

  function addJoin() {
    if (newJoin.targetTable && newJoin.sourceColumn && newJoin.targetColumn) {
      setJoins([...joins, newJoin]);
      setNewJoin({
        type: 'INNER',
        targetTable: '',
        sourceColumn: '',
        targetColumn: ''
      });
      setShowJoinModal(false);
    }
  }

  function removeJoin(index: number) {
    const updatedJoins = joins.filter((_, i) => i !== index);
    setJoins(updatedJoins);
  }

   function processQueryRules(ruleGroup: RuleGroupType): any {
    const processedRules = ruleGroup.rules.map((rule: any) => {
      if ('rules' in rule && Array.isArray(rule.rules)) {
        return {
          combinator: rule.combinator || 'and',
          rules: processQueryRules(rule).rules,
          isGroup: true // Mark as group for backend identification
        };
      } else {
        // This is a regular rule
        if (rule.field && rule.operator && rule.value !== undefined && rule.value !== '') {
          return {
            field: rule.field.includes('.') ? rule.field.split('.')[1] : rule.field,
            operator: rule.operator,
            value: rule.value,
            isGroup: false
          };
        }
      }
      return null;
    }).filter(Boolean); // Remove null values

    return { combinator: ruleGroup.combinator, rules: processedRules };
  }

  async function executeQuery() {
    if (!selectedTable) {
      setError('Please select a table first!');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Generated Query:', formatQuery(query, 'sql'));

      let selectClause = `${selectedTable}.*`;
      joins.forEach(join => {
        selectClause += `, ${join.targetTable}!${join.sourceColumn}(*)`;
      });

      let queryBuilder: any = supabase.from(selectedTable).select(selectClause);

      if (query.rules && query.rules.length > 0) {
        query.rules.forEach((rule: any) => {
          if (rule.field && rule.operator && rule.value !== undefined && rule.value !== '') {
            const field = rule.field.includes('.') ? rule.field.split('.')[1] : rule.field;
            const value = rule.value;
            
            switch (rule.operator) {
              case '=': queryBuilder = queryBuilder.eq(field, value); break;
              case '!=': queryBuilder = queryBuilder.neq(field, value); break;
              case '<': queryBuilder = queryBuilder.lt(field, value); break;
              case '>': queryBuilder = queryBuilder.gt(field, value); break;
              case '<=': queryBuilder = queryBuilder.lte(field, value); break;
              case '>=': queryBuilder = queryBuilder.gte(field, value); break;
              case 'contains': queryBuilder = queryBuilder.ilike(field, `%${value}%`); break;
              case 'beginsWith': queryBuilder = queryBuilder.ilike(field, `${value}%`); break;
              case 'endsWith': queryBuilder = queryBuilder.ilike(field, `%${value}`); break;
              case 'null': queryBuilder = queryBuilder.is(field, null); break;
              case 'notNull': queryBuilder = queryBuilder.not(field, 'is', null); break;
            }
          }
        });
      }

      const { data: result, error: queryError } = await queryBuilder;
      if (queryError) throw queryError;

      setData(result || []);
      setCurrentPage(1);
      console.log('Query executed successfully. Results:', result?.length);
    } catch (err: any) {
      setError(err.message);
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function sendToBackend() {
    if (!selectedTable) {
      setError('Please select a table first!');
      return;
    }

    setSendingToBackend(true);
    setError(null);

    try {
      const processedQuery = processQueryRules(query);

      const payload = {
        table: selectedTable,
        query: processedQuery, // Complete query with groups and rules
        conditions: processedQuery.rules,
        joins: joins,
        metadata: {
          totalRules: query.rules.length,
          hasNestedGroups: query.rules.some((rule: any) => 'rules' in rule),
          rootCombinator: query.combinator
        }
      };

      console.log('Sending to backend:', payload);
      console.log('Full query structure:', JSON.stringify(payload.query, null, 2));

      const response = await fetch('https://eumatrix.app.n8n.cloud/webhook/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Backend response:', result);
      
      if (Array.isArray(result)) {
        setData(result);
      } else if (result.data && Array.isArray(result.data)) {
        setData(result.data);
      } else if (result.results && Array.isArray(result.results)) {
        setData(result.results);
      } else {
        setData([result]);
      }
      
      setCurrentPage(1);
      alert('Data successfully received from backend!');
    } catch (err: any) {
      setError(`Backend error: ${err.message}`);
      console.error('Backend error:', err);
      alert('Failed to get data from backend!');
    } finally {
      setSendingToBackend(false);
    }
  }

  const getTableColumns = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div className="p-5 max-w-[1400px] mx-auto">
      <h1 className="mb-5 text-2xl font-bold text-white">
        {process.env.NEXT_PUBLIC_ORGANIZATION
          ? `${process.env.NEXT_PUBLIC_ORGANIZATION} Query Craft Data Engine`
          : "Query Craft Data Engine"}
      </h1>
      
      {/* Connection Status */}
      <div className={`p-4 mb-5 rounded-lg border flex items-center gap-3 ${
        connectionStatus === 'connected' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : connectionStatus === 'error' 
          ? 'bg-red-50 border-red-200 text-red-800' 
          : 'bg-yellow-50 border-yellow-200 text-yellow-800'
      }`}>
        {connectionStatus === 'checking' && <Loader className="w-5 h-5 animate-spin" />}
        {connectionStatus === 'connected' && <CheckCircle2 className="w-5 h-5" />}
        {connectionStatus === 'error' && <XCircle className="w-5 h-5" />}
        <div>
          <strong>Database Status: </strong>
          {connectionStatus === 'checking' && 'Checking connection...'}
          {connectionStatus === 'connected' && 'Connected to Supabase'}
          {connectionStatus === 'error' && 'Connection failed! Check your credentials.'}
        </div>
      </div>

      {/* Table Selector */}
      {connectionStatus === 'connected' && (
        <div className="border border-gray-300 rounded-lg p-5 mb-5 bg-white">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">Select Table</h2>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              disabled={loadingTables}
              className="flex-1 min-w-[200px] p-2.5 text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a table --</option>
              {tables.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
            <button
              onClick={loadTables}
              disabled={loadingTables}
              className="px-5 py-2.5 bg-gray-600 text-white border-none rounded-md cursor-pointer text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RotateCw className={`w-4 h-4 ${loadingTables ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          {selectedTable && (
            <p className="mt-2.5 text-gray-600 text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Selected: <strong>{selectedTable}</strong> {fields.length > 0 && `(${fields.length} columns)`}
            </p>
          )}
        </div>
      )}

      {/* Query Builder */}
      {selectedTable && fields.length > 0 && (
        <div className="border border-gray-300 rounded-lg p-5 mb-5 bg-white">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="m-0 text-xl font-semibold text-gray-800">Query Builder</h2>
            <div className="flex gap-2 flex-wrap">
              {joins.length > 0 && (
                <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-bold">
                  {joins.length} JOIN{joins.length > 1 ? 'S' : ''}
                </span>
              )}
              <button
                onClick={openJoinModal}
                className="px-4 py-2 bg-green-600 text-white border-none rounded-md cursor-pointer text-sm font-bold hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                JOIN
              </button>
            </div>
          </div>

          {joins.length > 0 && (
            <div className="mb-4 flex flex-col gap-2">
              {joins.map((join, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-md border border-blue-200 flex justify-between items-center flex-wrap gap-2">
                  <span className="text-gray-800 text-sm font-mono">
                    <strong className="text-blue-700">{join.type}</strong> {join.targetTable} 
                    <span className="text-gray-600"> ON </span>
                    {selectedTable}.{join.sourceColumn} = {join.targetTable}.{join.targetColumn}
                  </span>
                  <button
                    onClick={() => removeJoin(index)}
                    className="px-2.5 py-1 bg-red-600 text-white border-none rounded cursor-pointer text-xs hover:bg-red-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {loadingColumns ? (
            <p className="text-gray-600 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Loading columns...
            </p>
          ) : (
            <QueryBuilder fields={fields} query={query} onQueryChange={setQuery} />
          )}
        </div>
      )}

      {/* Execute Buttons */}
      {selectedTable && (
        <div className="mb-5 flex gap-2 flex-wrap">
          <button
            onClick={executeQuery}
            disabled={loading || connectionStatus !== 'connected' || !selectedTable}
            className="px-6 py-3 bg-blue-600 text-white border-none rounded-md cursor-pointer text-base font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Execute Query (Local)
              </>
            )}
          </button>

          <button
            onClick={sendToBackend}
            disabled={sendingToBackend || !selectedTable}
            className="px-6 py-3 bg-green-600 text-white border-none rounded-md cursor-pointer text-base font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sendingToBackend ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send to Backend
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 mb-5 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Results Table */}
      {data.length > 0 && (
        <div className="border border-gray-300 rounded-lg mb-5 bg-white overflow-hidden">
          <div className="p-5 border-b border-gray-300 bg-gray-50">
            <h2 className="m-0 text-xl font-semibold text-gray-800">
              Results ({data.length} total records)
            </h2>
          </div>

          <div className="overflow-x-auto max-w-full">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50">
                  {getTableColumns().map((column, index) => (
                    <th key={index} className="px-4 py-3 text-left border-b-2 border-gray-300 text-gray-700 font-semibold text-sm whitespace-nowrap sticky top-0 bg-gray-50 z-10">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={`transition-colors ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-200`}
                  >
                    {getTableColumns().map((column, colIndex) => (
                      <td key={colIndex} className="px-4 py-3 border-b border-gray-300 text-gray-800 text-sm max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {typeof row[column] === 'object' 
                          ? JSON.stringify(row[column]) 
                          : String(row[column] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={data.length}
          />
        </div>
      )}

      {/* JOIN Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-5">
          <div className="bg-white p-8 rounded-lg w-[500px] max-w-full max-h-[90vh] overflow-y-auto">
            <h3 className="mt-0 mb-4 text-xl font-semibold text-gray-800">Configure JOIN</h3>
            
            <div className="mb-4">
              <label className="block mb-1.5 text-gray-600 text-sm font-bold">Join Type:</label>
              <select
                value={newJoin.type}
                onChange={(e) => setNewJoin({...newJoin, type: e.target.value as any})}
                className="w-full p-2.5 text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INNER">INNER JOIN (matching records only)</option>
                <option value="LEFT">LEFT JOIN (all from left table)</option>
                <option value="RIGHT">RIGHT JOIN (all from right table)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1.5 text-gray-600 text-sm font-bold">Target Table:</label>
              <select
                value={newJoin.targetTable}
                onChange={(e) => onTargetTableChange(e.target.value)}
                className="w-full p-2.5 text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select table to join --</option>
                {tables.filter(t => t !== selectedTable).map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1.5 text-gray-600 text-sm font-bold">
                Source Column ({selectedTable}):
              </label>
              <select
                value={newJoin.sourceColumn}
                onChange={(e) => setNewJoin({...newJoin, sourceColumn: e.target.value})}
                disabled={!availableColumns[selectedTable]}
                className="w-full p-2.5 text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select column --</option>
                {(availableColumns[selectedTable] || []).map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block mb-1.5 text-gray-600 text-sm font-bold">
                Target Column ({newJoin.targetTable || 'select table first'}):
              </label>
              <select
                value={newJoin.targetColumn}
                onChange={(e) => setNewJoin({...newJoin, targetColumn: e.target.value})}
                disabled={!newJoin.targetTable || !availableColumns[newJoin.targetTable]}
                className="w-full p-2.5 text-base rounded-md border border-gray-300 bg-white text-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select column --</option>
                {(availableColumns[newJoin.targetTable] || []).map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-blue-50 rounded-md mb-5 text-sm text-gray-800 font-mono break-words">
              <strong>Preview:</strong><br/>
              {newJoin.targetTable && newJoin.sourceColumn && newJoin.targetColumn ? (
                `${newJoin.type} JOIN ${newJoin.targetTable} ON ${selectedTable}.${newJoin.sourceColumn} = ${newJoin.targetTable}.${newJoin.targetColumn}`
              ) : (
                'Select options above to see preview'
              )}
            </div>

            <div className="flex gap-2 justify-end flex-wrap">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setNewJoin({ type: 'INNER', targetTable: '', sourceColumn: '', targetColumn: '' });
                }}
                className="px-5 py-2.5 bg-gray-600 text-white border-none rounded-md cursor-pointer text-sm hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={addJoin}
                disabled={!newJoin.targetTable || !newJoin.sourceColumn || !newJoin.targetColumn}
                className="px-5 py-2.5 bg-blue-600 text-white border-none rounded-md cursor-pointer text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add JOIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
