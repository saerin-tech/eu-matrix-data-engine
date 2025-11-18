import { mapPostgresType } from '../../app/utils/typeMapping';

describe('PostgreSQL Type Mapping Utility', () => {
  describe('mapPostgresType', () => {
    it('should map integer types to number input', () => {
      expect(mapPostgresType('integer')).toBe('number');
      expect(mapPostgresType('bigint')).toBe('number');
      expect(mapPostgresType('int8')).toBe('number');
      expect(mapPostgresType('int4')).toBe('number');
      expect(mapPostgresType('numeric')).toBe('number');
      expect(mapPostgresType('real')).toBe('number');
      expect(mapPostgresType('double precision')).toBe('number');
    });

    it('should map boolean to checkbox input', () => {
      expect(mapPostgresType('boolean')).toBe('checkbox');
    });

    it('should map date/time types correctly', () => {
      expect(mapPostgresType('date')).toBe('date');
      expect(mapPostgresType('timestamp')).toBe('datetime-local');
      expect(mapPostgresType('timestamptz')).toBe('datetime-local');
      expect(mapPostgresType('time')).toBe('time');
    });

    it('should default unknown types to text input', () => {
      expect(mapPostgresType('varchar')).toBe('text');
      expect(mapPostgresType('text')).toBe('text');
      expect(mapPostgresType('unknown_type')).toBe('text');
      expect(mapPostgresType('jsonb')).toBe('text');
    });

    it('should handle case-insensitive type names', () => {
      expect(mapPostgresType('INTEGER')).toBe('number');
      expect(mapPostgresType('Boolean')).toBe('checkbox');
      expect(mapPostgresType('TIMESTAMP')).toBe('datetime-local');
    });

    it('should handle empty string', () => {
      expect(mapPostgresType('')).toBe('text');
    });
  });
});
