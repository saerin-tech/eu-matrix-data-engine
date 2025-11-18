export function mapPostgresType(pgType: string): string {
  const map: { [key: string]: string } = {
    'integer': 'number',
    'bigint': 'number',
    'int8': 'number',
    'int4': 'number',
    'numeric': 'number',
    'real': 'number',
    'double precision': 'number',
    'boolean': 'checkbox',
    'date': 'date',
    'timestamp': 'datetime-local',
    'timestamptz': 'datetime-local',
    'time': 'time',
  };
  return map[pgType.toLowerCase()] || 'text';
}
