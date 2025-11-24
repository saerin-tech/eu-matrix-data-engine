"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RuleGroupType, Field } from 'react-querybuilder';
import ConnectionStatus from './components/ConnectionStatus';
import TableSelector from './components/TableSelector';
import QueryBuilderSection from './components/QueryBuilderSection';
import JoinModal from './components/JoinModal';
import ExecuteButton from './components/ExecuteButton';
import ErrorAlert from './components/ErrorAlert';
import ResultsTable from './components/ResultsTable';
import { JoinConfig, ConnectionStatus as Status } from './types';
import { useQueryBuilder } from './hooks/useQueryBuilder';
import { Loader, LogOut } from 'lucide-react';

const initialQuery: RuleGroupType = {
  combinator: 'and',
  rules: [],
};

export default function Page() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<Status>('checking');
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [fields, setFields] = useState<Field[]>([]);
  const [query, setQuery] = useState<RuleGroupType>(initialQuery);
  const [joins, setJoins] = useState<JoinConfig[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [queryExecuted, setQueryExecuted] = useState(false); 
  
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState(false);
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newJoin, setNewJoin] = useState<JoinConfig>({
    type: 'RIGHT',
    targetTable: '',
    sourceColumn: '',
    targetColumn: ''
  });
  const [availableColumns, setAvailableColumns] = useState<{[key: string]: string[]}>({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { 
    checkConnection, 
    loadTables: fetchTables, 
    loadTableColumns,
    executeQuery: runQuery 
  } = useQueryBuilder(setConnectionStatus, setTables, setFields, setData, setError, setAvailableColumns);

  // Check authentication
  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');
    
    if (!userId || !userName) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
      setUserEmail(userName);
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      checkConnection();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      handleLoadTables();
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (selectedTable && selectedTable.trim() !== '') {
      handleLoadColumns(selectedTable);
    } else {
      setFields([]);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable && joins.length > 0) {
      loadAllFieldsWithJoins();
    }
  }, [joins]);

  async function handleLoadTables() {
    setLoadingTables(true);
    await fetchTables();
    setLoadingTables(false);
  }

  async function handleLoadColumns(tableName: string) {
    setLoadingColumns(true);
    await loadTableColumns(tableName);
    setLoadingColumns(false);
  }

  async function loadAllFieldsWithJoins() {
    setLoadingColumns(true);
    try {
      const mainFields = await loadFieldsForTable(selectedTable);
      const joinedFields = await Promise.all(
        joins.map(join => loadFieldsForTable(join.targetTable))
      );
      setFields([...mainFields, ...joinedFields.flat()]);
    } catch (err) {
      console.error('Error loading joined fields:', err);
    } finally {
      setLoadingColumns(false);
    }
  }

  async function loadFieldsForTable(tableName: string): Promise<Field[]> {
    const response = await fetch('/api/columns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName })
    });
    
    const result = await response.json();
    if (!response.ok || !result.columns) return [];
    
    const columnNames = result.columns.map((col: any) => col.name);
    setAvailableColumns(prev => ({ ...prev, [tableName]: columnNames }));
    
    return result.columns.map((col: any) => ({
      name: `${tableName}.${col.name}`,
      label: `${tableName}.${col.name}`,
      inputType: mapPostgresType(col.type),
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

  async function handleOpenJoinModal() {
    setShowJoinModal(true);
    if (!availableColumns[selectedTable]) {
      await handleLoadColumns(selectedTable);
    }
  }

  async function handleTargetTableChange(tableName: string) {
    setNewJoin({...newJoin, targetTable: tableName, sourceColumn: '', targetColumn: ''});
    if (tableName && !availableColumns[tableName]) {
      await handleLoadColumns(tableName);
    }
  }

  function handleAddJoin() {
    if (newJoin.targetTable && newJoin.sourceColumn && newJoin.targetColumn) {
      setJoins([...joins, newJoin]);
      setNewJoin({ type: 'INNER', targetTable: '', sourceColumn: '', targetColumn: '' });
      setShowJoinModal(false);
    }
  }

  function handleRemoveJoin(index: number) {
    setJoins(joins.filter((_, i) => i !== index));
  }

  async function handleExecuteQuery() {
    if (!selectedTable) {
      setError('Please select a table first!');
      return;
    }
    setLoadingQuery(true);
    setQueryExecuted(true); 
    await runQuery(selectedTable, query, joins);
    setLoadingQuery(false);
    setCurrentPage(1);
  }

  function handleLogout() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    router.push('/login');
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-5 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">
          {process.env.NEXT_PUBLIC_ORGANIZATION
            ? `${process.env.NEXT_PUBLIC_ORGANIZATION} Explore EUmatrix political data`
            : "Explore EUmatrix political data"}
        </h1>
        
        <div className="flex items-center gap-3">
          <span className="text-gray-300 text-sm">
            Welcome, <strong>{userEmail}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 cursor-pointer text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
      
      <ConnectionStatus status={connectionStatus} />

      {connectionStatus === 'connected' && (
        <>
          <TableSelector
            tables={tables}
            selectedTable={selectedTable}
            fieldsCount={fields.length}
            loading={loadingTables}
            onTableChange={setSelectedTable}
            onRefresh={handleLoadTables}
          />

          {selectedTable && fields.length > 0 && (
            <QueryBuilderSection
              fields={fields}
              query={query}
              joins={joins}
              selectedTable={selectedTable}
              loading={loadingColumns}
              onQueryChange={setQuery}
              onOpenJoinModal={handleOpenJoinModal}
              onRemoveJoin={handleRemoveJoin}
            />
          )}

          {selectedTable && (
            <div className="mb-5">
              <ExecuteButton
                loading={loadingQuery}
                disabled={loadingQuery || !selectedTable}
                onClick={handleExecuteQuery}
              />
            </div>
          )}

          <ErrorAlert message={error} />

          <ResultsTable
            data={data}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            queryExecuted={queryExecuted} 
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(items) => {
              setItemsPerPage(items); 
              setCurrentPage(1);
            }}
          />

          <JoinModal
            show={showJoinModal}
            join={newJoin}
            tables={tables}
            selectedTable={selectedTable}
            availableColumns={availableColumns}
            onClose={() => {
              setShowJoinModal(false);
              setNewJoin({ type: 'INNER', targetTable: '', sourceColumn: '', targetColumn: '' });
            }}
            onJoinChange={setNewJoin}
            onTargetTableChange={handleTargetTableChange}
            onAdd={handleAddJoin}
          />
        </>
      )}
    </div>
  );
}