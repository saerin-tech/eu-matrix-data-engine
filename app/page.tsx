"use client"
import { useState, useEffect } from 'react';
import { QueryBuilder, RuleGroupType, formatQuery, Field } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';
import { supabase } from './lib/supabase';
import Pagination from './components/Pagination';

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
  
  // JOIN states
  const [joins, setJoins] = useState<JoinConfig[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newJoin, setNewJoin] = useState<JoinConfig>({
    type: 'INNER',
    targetTable: '',
    sourceColumn: '',
    targetColumn: ''
  });
  const [availableColumns, setAvailableColumns] = useState<{[key: string]: string[]}>({});

  // Send to backend state
  const [sendingToBackend, setSendingToBackend] = useState(false);

  // Pagination states
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
        console.log('✅ Supabase connection successful!');
      } else {
        throw new Error('Supabase client not initialized');
      }
    } catch (err) {
      setConnectionStatus('error');
      console.error('❌ Connection failed:', err);
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
      console.log('✅ Tables loaded:', tableNames);
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
      console.log('✅ Columns loaded:', newFields);
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
      console.log('✅ All fields loaded with joins:', allFields);
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
              case '=':
                queryBuilder = queryBuilder.eq(field, value);
                break;
              case '!=':
                queryBuilder = queryBuilder.neq(field, value);
                break;
              case '<':
                queryBuilder = queryBuilder.lt(field, value);
                break;
              case '>':
                queryBuilder = queryBuilder.gt(field, value);
                break;
              case '<=':
                queryBuilder = queryBuilder.lte(field, value);
                break;
              case '>=':
                queryBuilder = queryBuilder.gte(field, value);
                break;
              case 'contains':
                queryBuilder = queryBuilder.ilike(field, `%${value}%`);
                break;
              case 'beginsWith':
                queryBuilder = queryBuilder.ilike(field, `${value}%`);
                break;
              case 'endsWith':
                queryBuilder = queryBuilder.ilike(field, `%${value}`);
                break;
              case 'null':
                queryBuilder = queryBuilder.is(field, null);
                break;
              case 'notNull':
                queryBuilder = queryBuilder.not(field, 'is', null);
                break;
            }
          }
        });
      }

      const { data: result, error: queryError } = await queryBuilder;

      if (queryError) throw queryError;

      setData(result || []);
      setCurrentPage(1);
      console.log('✅ Query executed successfully. Results:', result?.length);
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
      const conditions = query.rules
        .filter((rule: any) => 
          rule.field && 
          rule.operator && 
          rule.value !== undefined && 
          rule.value !== ''
        )
        .map((rule: any) => ({
          field: rule.field.includes('.') ? rule.field.split('.')[1] : rule.field,
          operator: rule.operator,
          value: rule.value,
        }));

      const payload = {
        table: selectedTable,
        conditions: conditions,
        joins: joins,
      };

      console.log('📤 Sending to backend:', payload);

      const response = await fetch('https://eumatrix.app.n8n.cloud/webhook/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      console.log('✅ Backend response:', result);
      
      // Backend se data save karo
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
      alert('✅ Data successfully received from backend!');

    } catch (err: any) {
      setError(`Backend error: ${err.message}`);
      console.error('❌ Backend error:', err);
      alert('❌ Failed to get data from backend!');
    } finally {
      setSendingToBackend(false);
    }
  }

  // Get table columns from data
  const getTableColumns = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>EU Matrix Data Engine</h1>
      
      {/* Connection Status */}
      <div style={{
        padding: '15px',
        marginBottom: '20px',
        borderRadius: '8px',
        backgroundColor: connectionStatus === 'connected' ? '#d4edda' : 
                        connectionStatus === 'error' ? '#f8d7da' : '#fff3cd',
        border: `1px solid ${connectionStatus === 'connected' ? '#c3e6cb' : 
                             connectionStatus === 'error' ? '#f5c6cb' : '#ffeaa7'}`,
        color: connectionStatus === 'connected' ? '#155724' : 
               connectionStatus === 'error' ? '#721c24' : '#856404'
      }}>
        <strong>Database Status: </strong>
        {connectionStatus === 'checking' && '🔄 Checking connection...'}
        {connectionStatus === 'connected' && '✅ Connected to Supabase'}
        {connectionStatus === 'error' && '❌ Connection failed! Check your credentials.'}
      </div>

      {/* Table Selector */}
      {connectionStatus === 'connected' && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#fff'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#333' }}>Select Table</h2>
          <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              disabled={loadingTables}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                color: '#333',
                cursor: 'pointer'
              }}
            >
              <option value="">-- Select a table --</option>
              {tables.map(table => (
                <option key={table} value={table}>{table}</option>
              ))}
            </select>
            <button
              onClick={loadTables}
              disabled={loadingTables}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {loadingTables ? '⏳' : '🔄'} Refresh
            </button>
          </div>
          {selectedTable && (
            <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
              📊 Selected: <strong>{selectedTable}</strong> {fields.length > 0 && `(${fields.length} columns)`}
            </p>
          )}
        </div>
      )}

      {/* Query Builder */}
      {selectedTable && fields.length > 0 && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          backgroundColor: '#fff'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0, color: '#333' }}>Query Builder</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {joins.length > 0 && (
                <span style={{ 
                  padding: '8px 12px', 
                  backgroundColor: '#e7f3ff', 
                  color: '#0056b3',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {joins.length} JOIN{joins.length > 1 ? 'S' : ''}
                </span>
              )}
              <button
                onClick={openJoinModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                + JOIN
              </button>
            </div>
          </div>

          {joins.length > 0 && (
            <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {joins.map((join, index) => (
                <div key={index} style={{
                  padding: '10px 12px',
                  backgroundColor: '#f0f8ff',
                  borderRadius: '6px',
                  border: '1px solid #b3d9ff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <span style={{ color: '#333', fontSize: '13px', fontFamily: 'monospace' }}>
                    <strong style={{ color: '#0056b3' }}>{join.type}</strong> {join.targetTable} 
                    <span style={{ color: '#666' }}> ON </span>
                    {selectedTable}.{join.sourceColumn} = {join.targetTable}.{join.targetColumn}
                  </span>
                  <button
                    onClick={() => removeJoin(index)}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {loadingColumns ? (
            <p style={{ color: '#666' }}>⏳ Loading columns...</p>
          ) : (
            <QueryBuilder
              fields={fields}
              query={query}
              onQueryChange={setQuery}
            />
          )}
        </div>
      )}

      {/* Execute Buttons */}
      {selectedTable && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={executeQuery}
            disabled={loading || connectionStatus !== 'connected' || !selectedTable}
            style={{
              padding: '12px 24px',
              backgroundColor: connectionStatus === 'connected' && selectedTable ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: connectionStatus === 'connected' && selectedTable ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Loading...' : '🔍 Execute Query (Local)'}
          </button>

          <button
            onClick={sendToBackend}
            disabled={sendingToBackend || !selectedTable}
            style={{
              padding: '12px 24px',
              backgroundColor: selectedTable ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedTable ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {sendingToBackend ? '⏳ Sending...' : '📤 Send to Backend'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Table */}
      {data.length > 0 && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: '#fff',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '20px', 
            borderBottom: '1px solid #ddd',
            backgroundColor: '#f8f9fa'
          }}>
            <h2 style={{ margin: 0, color: '#333' }}>
              Results ({data.length} total records)
            </h2>
          </div>

          {/* Table with horizontal scroll */}
          <div style={{
            overflowX: 'auto',
            maxWidth: '100%'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '600px'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  {getTableColumns().map((column, index) => (
                    <th key={index} style={{
                      padding: '12px 15px',
                      textAlign: 'left',
                      borderBottom: '2px solid #dee2e6',
                      color: '#495057',
                      fontWeight: '600',
                      fontSize: '14px',
                      whiteSpace: 'nowrap',
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#f8f9fa',
                      zIndex: 10
                    }}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.map((row, rowIndex) => (
                  <tr key={rowIndex} style={{
                    backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f8f9fa',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fff' : '#f8f9fa'}
                  >
                    {getTableColumns().map((column, colIndex) => (
                      <td key={colIndex} style={{
                        padding: '12px 15px',
                        borderBottom: '1px solid #dee2e6',
                        color: '#212529',
                        fontSize: '14px',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
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

          {/* Pagination */}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Configure JOIN</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                Join Type:
              </label>
              <select
                value={newJoin.type}
                onChange={(e) => setNewJoin({...newJoin, type: e.target.value as any})}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                <option value="INNER">INNER JOIN (matching records only)</option>
                <option value="LEFT">LEFT JOIN (all from left table)</option>
                <option value="RIGHT">RIGHT JOIN (all from right table)</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                Target Table:
              </label>
              <select
                value={newJoin.targetTable}
                onChange={(e) => onTargetTableChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Select table to join --</option>
                {tables.filter(t => t !== selectedTable).map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                Source Column ({selectedTable}):
              </label>
              <select
                value={newJoin.sourceColumn}
                onChange={(e) => setNewJoin({...newJoin, sourceColumn: e.target.value})}
                disabled={!availableColumns[selectedTable]}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Select column --</option>
                {(availableColumns[selectedTable] || []).map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                Target Column ({newJoin.targetTable || 'select table first'}):
              </label>
              <select
                value={newJoin.targetColumn}
                onChange={(e) => setNewJoin({...newJoin, targetColumn: e.target.value})}
                disabled={!newJoin.targetTable || !availableColumns[newJoin.targetTable]}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  backgroundColor: '#fff',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Select column --</option>
                {(availableColumns[newJoin.targetTable] || []).map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div style={{ 
              padding: '12px', 
              backgroundColor: '#e7f3ff', 
              borderRadius: '6px', 
              marginBottom: '20px',
              fontSize: '13px',
              color: '#333',
              fontFamily: 'monospace',
              wordBreak: 'break-word'
            }}>
              <strong>Preview:</strong><br/>
              {newJoin.targetTable && newJoin.sourceColumn && newJoin.targetColumn ? (
                `${newJoin.type} JOIN ${newJoin.targetTable} ON ${selectedTable}.${newJoin.sourceColumn} = ${newJoin.targetTable}.${newJoin.targetColumn}`
              ) : (
                'Select options above to see preview'
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setNewJoin({ type: 'INNER', targetTable: '', sourceColumn: '', targetColumn: '' });
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addJoin}
                disabled={!newJoin.targetTable || !newJoin.sourceColumn || !newJoin.targetColumn}
                style={{
                  padding: '10px 20px',
                  backgroundColor: (newJoin.targetTable && newJoin.sourceColumn && newJoin.targetColumn) ? '#007bff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (newJoin.targetTable && newJoin.sourceColumn && newJoin.targetColumn) ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
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