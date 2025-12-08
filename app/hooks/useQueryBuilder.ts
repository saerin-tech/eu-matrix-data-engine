import { RuleGroupType, Field } from 'react-querybuilder';
import { JoinConfig, ConnectionStatus } from '../types';

export function useQueryBuilder(
  setConnectionStatus: (status: ConnectionStatus) => void,
  setTables: (tables: string[]) => void,
  setFields: (fields: Field[]) => void,
  setData: (data: any[]) => void,
  setError: (error: string | null) => void,
  setAvailableColumns: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>
) {
  async function checkConnection() {
    try {
      const response = await fetch('/api/tables');
      if (response.ok) {
        setConnectionStatus('connected');
        console.log('Backend API connection successful!');
      } else {
        throw new Error('Backend not responding');
      }
    } catch (err) {
      setConnectionStatus('error');
      console.error('Connection failed:', err);
    }
  }

  async function loadTables() {
    setError(null);
    try {
      const response = await fetch('/api/tables');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load tables');
      }
      
      setTables(result.tables || []);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Failed to load tables. Please check backend connection.');
    }
  }

  async function loadTableColumns(tableName: string) {
    setError(null);
    try {
      const response = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to load columns');
      }
      
      const columnNames = result.columns.map((col: any) => col.name);
      setAvailableColumns(prev => ({ ...prev, [tableName]: columnNames }));
      
      const newFields: Field[] = result.columns.map((col: any) => ({
        name: `${tableName}.${col.name}`,
        label: `${tableName}.${col.name}`,
        inputType: mapPostgresType(col.type),
      }));
      
      setFields(newFields);
    } catch (err: any) {
      console.error('Error:', err);
      setError('Could not load columns. Make sure RPC function exists.');
    }
  }

  function processQueryRules(ruleGroup: RuleGroupType): any {
    const processedRules = ruleGroup.rules.map((rule: any) => {
      if ('rules' in rule && Array.isArray(rule.rules)) {
        return {
          combinator: rule.combinator || 'and',
          rules: processQueryRules(rule).rules,
          isGroup: true
        };
      } else {
        if (rule.field && rule.operator && rule.value !== undefined && rule.value !== '') {
          return {
            field: rule.field,
            operator: rule.operator,
            value: rule.value,
            isGroup: false
          };
        }
      }
      return null;
    }).filter(Boolean);

    return { combinator: ruleGroup.combinator, rules: processedRules };
  }

 
  async function executeQuery(
    selectedTable: string, 
    selectedColumns: { table: string; column: string; alias: string }[], 
    query: RuleGroupType, 
    joins: JoinConfig[]
  ) {
    setError(null);
    setData([]);
    
    try {
      const processedQuery = processQueryRules(query);

      
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          table: selectedTable, 
          query: processedQuery,
          joins: joins,
          selectedColumns: selectedColumns 
        })
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        setError(result.userMessage || 'Query error');
        console.error('Query error details:', result.devMessage || result);
        return null;
      }
      if(result.sqlQuery){
        console.log(result.sqlQuery, "Result query");
      }

      setData(result.data || []);
      return result;

    } catch (err: any) {
      setError('Network error: Unable to execute query');
      console.error('Query execution error:', err);
      return null;
    }
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

  return {
    checkConnection,
    loadTables,
    loadTableColumns,
    executeQuery
  }
}