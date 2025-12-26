"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RuleGroupType, Field } from 'react-querybuilder';
import { Loader, Database as DatabaseIcon, RefreshCw } from 'lucide-react';
import Header from './components/Header';
import TableSelector from './components/TableSelector';
import QueryBuilderSection from './components/QueryBuilderSection';
import JoinModal from './components/JoinModal';
import CreateUserModal from './components/CreateUserModal';
import AddDatabaseModal from './components/AddDatabaseModal';
import UserManagement from './components/user-management/UserManagement';
import ErrorAlert from './components/ErrorAlert';
import ResultsTable from './components/ResultsTable';
import Footer from './components/Footer';
import Select from './components/shared/Select';
import Button from './components/shared/Button';
import { Database, JoinConfig, ConnectionStatus as Status, UserRole } from './types';
import { useQueryBuilder } from './hooks/useQueryBuilder';

const INITIAL_QUERY: RuleGroupType = { combinator: 'and', rules: [] };

export default function Page() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('User');

  // Modal state
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showAddDatabaseModal, setShowAddDatabaseModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Database state
  const [databases, setDatabases] = useState<Database[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>('');
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<Status>('checking');
  const [refreshingDatabase, setRefreshingDatabase] = useState(false);

  // Query builder state
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [fields, setFields] = useState<Field[]>([]);
  const [query, setQuery] = useState<RuleGroupType>(INITIAL_QUERY);
  const [joins, setJoins] = useState<JoinConfig[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<{ table: string; column: string; alias: string }[]>([]);
    const [availableColumns, setAvailableColumns] = useState<{ [key: string]: string[] }>({});
  
  // Join modal state
  const [newJoin, setNewJoin] = useState<JoinConfig>({
    type: 'RIGHT',
    targetTable: '',
    sourceColumn: '',
    targetColumn: ''
  });
  // Results state
  const [data, setData] = useState<any[]>([]);
  const [queryExecuted, setQueryExecuted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Loading state
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    checkConnection, 
    loadTables: fetchTables, 
    loadTableColumns,
    executeQuery: runQuery 
  } = useQueryBuilder(
    setConnectionStatus,
    setTables,
    setFields,
    setData,
    setError,
    setAvailableColumns,
    selectedDatabaseId
  );

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');
    const storedRole = sessionStorage.getItem('userRole');
    
    if (!userId || !userName) {
      router.push('/login');
      return;
    }
    const role = (storedRole === 'Admin' || storedRole === 'User') ? storedRole as UserRole : 'User';
    
      setIsAuthenticated(true);
      setUserEmail(userName);
    setUserRole(role);
      setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) loadDatabases();
  }, [isAuthenticated]);

  // Initialize database when selected
  useEffect(() => {
    if (selectedDatabaseId) handleDatabaseChange(selectedDatabaseId);
  }, [selectedDatabaseId]);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      handleLoadTables();
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (selectedTable && selectedTable.trim() !== '') {
      handleLoadColumns(selectedTable);
      setSelectedColumns([]);
    } else {
      setFields([]);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable && joins.length > 0) {
      loadAllFieldsWithJoins();
    }
  }, [joins]);

  // Database operations
  async function loadDatabases() {
    setLoadingDatabases(true);
    try {
      const response = await fetch('/api/databases');
      const result = await response.json();

      if (result.success) {
        setDatabases(result.databases);
        const defaultDb = result.databases.find((db: Database) => db.is_default);
        if (defaultDb && !selectedDatabaseId) setSelectedDatabaseId(defaultDb.id);
      }
    } catch (err) {
      console.error('Failed to load databases:', err);
      setError('Failed to load databases');
    } finally {
      setLoadingDatabases(false);
    }
  }

 async function handleDatabaseChange(databaseId: string) {
  setConnectionStatus('checking')
  setTables([])
  setSelectedTable('')
  setFields([])
  setData([])
  setJoins([])
  setQueryExecuted(false)
  setError(null)
  
  try {
    // Deploy RPC functions with cache reload
    const response = await fetch('/api/databases/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ databaseId })
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message)
    }

    // Check connection
    await checkConnection()

  } catch (error: any) {
    console.error(' Database change failed:', error.message)
    setConnectionStatus('error')
    setError(error.message || 'Failed to switch database')
  }
}

  // Refresh database function
  async function handleRefreshDatabase() {
    if (!selectedDatabaseId) return;
    
    setRefreshingDatabase(true);
    await loadDatabases();
    setRefreshingDatabase(false);
  }

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
        joins?.map(join => loadFieldsForTable(join.targetTable))
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
      body: JSON.stringify({ tableName, databaseId: selectedDatabaseId })
    });
    
    const result = await response.json();
    if (!response.ok || !result.columns) return [];
    
    const columnNames = result.columns?.map((col: { name: string }) => col.name);
    setAvailableColumns(prev => ({ ...prev, [tableName]: columnNames }));

    return result?.columns?.map((col: { name: string }) => ({
      name: `${tableName}.${col.name}`,
      label: `${tableName}.${col.name}`,
      inputType: 'text',
    }));
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
    setQueryExecuted(false);
    await runQuery(selectedTable, selectedColumns, query, joins);
    setQueryExecuted(true);
    setLoadingQuery(false);
    setCurrentPage(1);
  }

  function handleLogout() {
    sessionStorage.clear();
    router.push('/login');
  }

  // Get selected database name
  const selectedDatabaseName = databases.find(db => db.id == selectedDatabaseId)?.name || '';
  
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
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

  // Show User Management component if active
  if (showUserManagement) {
    return (
      <div className="min-h-screen flex flex-col p-3 sm:p-5 max-w-[1400px] mx-auto">
        <Header 
          userEmail={userEmail}
          userRole={userRole}
          onLogout={handleLogout}
          onCreateUser={() => setShowCreateUserModal(true)}
          onManageUsers={() => setShowUserManagement(true)}
          onAddDatabase={() => setShowAddDatabaseModal(true)}
          organizationName={process.env.NEXT_PUBLIC_ORGANIZATION}
          organizationSubHeading={process.env.NEXT_PUBLIC_ORGANIZATION_SUB_HEADING}
        />
        <UserManagement />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-3 sm:p-5 max-w-[1400px] mx-auto">
      
      <Header 
        userEmail={userEmail}
        userRole={userRole}
        onLogout={handleLogout}
        onCreateUser={() => setShowCreateUserModal(true)}
        onManageUsers={() => setShowUserManagement(true)}
        onAddDatabase={() => setShowAddDatabaseModal(true)}
        organizationName={process.env.NEXT_PUBLIC_ORGANIZATION}
        organizationSubHeading={process.env.NEXT_PUBLIC_ORGANIZATION_SUB_HEADING}
      />

      <CreateUserModal
          show={showCreateUserModal}
          creatorRole={userRole}
          creatorUserName={userEmail}
          onClose={() => setShowCreateUserModal(false)}
      />

      <AddDatabaseModal
        show={showAddDatabaseModal}
        onClose={() => setShowAddDatabaseModal(false)}
        onDatabaseAdded={loadDatabases}
      />

      <main className="flex-grow">
        {/* Database Selector with Refresh Button - Screenshot Style */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border border-slate-600 rounded-xl p-4 mb-0 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <DatabaseIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Select Database Connection</h3>
                <p className="text-xs text-slate-300">Choose the database you want to query</p>
              </div>
            </div>
            <Button
              variant="primary"
              icon={<RefreshCw className={`w-4 h-4 ${refreshingDatabase ? 'animate-spin' : ''}`} />}
              onClick={handleRefreshDatabase}
              disabled={!selectedDatabaseId || refreshingDatabase}
            >
              {refreshingDatabase ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <div className="mb-0">
            <Select
              options={databases?.map(db => ({
                value: db?.id,
                label: db.is_default ? `${db?.name} (Default)` : db?.name
              }))}
              value={selectedDatabaseId}
              onChange={(e) => setSelectedDatabaseId(e.target.value)}
              placeholder="Choose a database..."
            />
          </div>
        </div>

        {/* Connection Status Bar - Screenshot Style */}
        {selectedDatabaseId && (
          <div className={`px-4 py-2 flex items-center gap-2 text-sm font-medium border-x border-b rounded-b-xl mb-4 ${
            connectionStatus === 'connected' 
              ? 'bg-slate-800 border-slate-600 text-slate-200' 
              : connectionStatus === 'error'
              ? 'bg-slate-800 border-slate-600 text-slate-200'
              : 'bg-slate-800 border-slate-600 text-slate-200'
          }`}>
            <span className="text-slate-400">Connected to:</span>
            <span className="text-white font-semibold">{selectedDatabaseName}</span>
            <span className={`ml-auto px-3 py-1 rounded-md text-xs font-bold ${
              connectionStatus === 'connected'
                ? 'bg-green-600 text-white'
                : connectionStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-yellow-600 text-white'
            }`}>
              {connectionStatus === 'connected' ? 'connected' : connectionStatus === 'error' ? 'disconnected' : 'checking...'}
            </span>
          </div>
        )}

      {connectionStatus === 'connected' ? (
        <>
          <TableSelector
            tables={tables}
            selectedTable={selectedTable}
            fieldsCount={fields.length}
            loading={loadingTables}
            onTableChange={setSelectedTable}
            onRefresh={handleLoadTables}
            onOpenJoinModal={handleOpenJoinModal}
            joins={joins}
            onRemoveJoin={handleRemoveJoin}
          />

          {selectedTable && fields.length > 0 && (
            <QueryBuilderSection
              fields={fields}
              query={query}
              joins={joins}
              selectedTable={selectedTable}
              databaseId={selectedDatabaseId}
              loading={loadingColumns}
              queryExecuting={loadingQuery}
              onQueryChange={setQuery}
              onRemoveJoin={handleRemoveJoin}
              onColumnsChange={setSelectedColumns} 
                onExecuteQuery={handleExecuteQuery}
                executeDisabled={loadingQuery || !selectedTable}
              />
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
        ) : connectionStatus === 'checking' ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-300">Connecting to database...</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-400 text-lg font-semibold mb-2">Failed to connect to database</p>
              <p className="text-gray-400 text-sm">Please check your database configuration</p>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}