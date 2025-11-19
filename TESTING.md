# Query Craft Data Engine - Test Documentation

## Overview
This document provides comprehensive test coverage for the Query Craft Data Engine project, including unit tests, integration tests, and end-to-end test scenarios.

## Test Setup

### Installation
First, install the testing dependencies:

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
__tests__/
├── Pagination.test.tsx          # Component tests for pagination
├── integration.test.ts          # Integration tests for core functionality
└── utils/
    └── typeMapping.test.ts      # Unit tests for type mapping utility
```

## Test Categories

### 1. Component Tests

#### Pagination Component (`__tests__/Pagination.test.tsx`)

**Test Coverage:**
- ✅ Rendering with correct information display
- ✅ Page range calculations for different scenarios
- ✅ Items per page dropdown functionality
- ✅ Page navigation and callbacks
- ✅ Current page highlighting
- ✅ Edge cases (single page, empty data, many pages)
- ✅ Accessibility features

**Key Test Cases:**
```typescript
// Example: Testing pagination display
it('should render pagination component with correct information', () => {
  // Renders: "Showing 1 to 10 of 100 records"
  // Verifies: Correct calculation and display
});

// Example: Testing items per page change
it('should call onItemsPerPageChange when items per page is changed', () => {
  // User selects 25 items per page
  // Verifies: Callback fired with correct value
});
```

### 2. Utility Tests

#### Type Mapping (`__tests__/utils/typeMapping.test.ts`)

**Test Coverage:**
- ✅ PostgreSQL integer types → HTML number input
- ✅ Boolean type → checkbox input
- ✅ Date/time types → appropriate HTML5 inputs
- ✅ Unknown types → text input (default)
- ✅ Case-insensitive type matching
- ✅ Edge cases (empty string, special characters)

**Supported Type Mappings:**
| PostgreSQL Type | HTML Input Type |
|----------------|-----------------|
| integer, bigint, int4, int8, numeric, real, double precision | number |
| boolean | checkbox |
| date | date |
| timestamp, timestamptz | datetime-local |
| time | time |
| text, varchar, etc. | text (default) |

### 3. Integration Tests

#### Database Connection (`__tests__/integration.test.ts`)

**Test Coverage:**
- ✅ Supabase client initialization
- ✅ Environment variable validation
- ✅ RPC function call formatting
- ✅ Error handling for connection failures

**Example Test:**
```typescript
it('should format get_tables_list RPC call correctly', () => {
  // Verifies: RPC called with correct function name
  // Expected: 'get_tables_list' with no parameters
});
```

#### Query Builder Logic

**Test Coverage:**
- ✅ Query operator mapping (=, !=, <, >, <=, >=, contains, etc.)
- ✅ Field name parsing (table.column format)
- ✅ Supabase method chaining
- ✅ Complex query conditions

**Operator Mapping Tests:**
| Operator | Supabase Method | Example Value |
|----------|----------------|---------------|
| = | eq() | 'test' |
| != | neq() | 'test' |
| < | lt() | 10 |
| > | gt() | 10 |
| <= | lte() | 10 |
| >= | gte() | 10 |
| contains | ilike() | '%test%' |
| beginsWith | ilike() | 'test%' |
| endsWith | ilike() | '%test' |
| null | is() | null |
| notNull | not() | null |

#### JOIN Configuration

**Test Coverage:**
- ✅ Valid JOIN types (INNER, LEFT, RIGHT)
- ✅ JOIN configuration structure validation
- ✅ Complete vs incomplete configuration detection
- ✅ Multiple JOIN support

**Example JOIN Configuration:**
```typescript
{
  type: 'INNER',
  targetTable: 'orders',
  sourceColumn: 'user_id',
  targetColumn: 'id'
}
```

#### Backend Webhook Integration

**Test Coverage:**
- ✅ Payload structure validation
- ✅ Condition filtering (remove empty/invalid rules)
- ✅ HTTP POST request with correct headers
- ✅ Success response handling
- ✅ Error response handling
- ✅ Response data format variations

**Payload Structure:**
```json
{
  "table": "users",
  "conditions": [
    {
      "field": "email",
      "operator": "contains",
      "value": "@example.com"
    }
  ],
  "joins": [
    {
      "type": "INNER",
      "targetTable": "orders",
      "sourceColumn": "id",
      "targetColumn": "user_id"
    }
  ]
}
```

#### Data Handling

**Test Coverage:**
- ✅ Pagination calculations (total pages, indices)
- ✅ Table column extraction from data
- ✅ Empty data handling
- ✅ Nested object serialization
- ✅ Page change callbacks

## Manual Test Scenarios

### Scenario 1: Database Connection
1. Open application
2. Verify connection status displays "✅ Connected to Supabase"
3. Check browser console for connection log
4. **Expected**: Green success banner, no errors

### Scenario 2: Table Loading
1. Click "Refresh" button next to table dropdown
2. Verify tables populate in dropdown
3. Select a table
4. **Expected**: Table columns load automatically, column count displays

### Scenario 3: Simple Query
1. Select a table (e.g., "users")
2. Click "+ Rule" in query builder
3. Select field: "users.email"
4. Select operator: "contains"
5. Enter value: "@example.com"
6. Click "🔍 Execute Query (Local)"
7. **Expected**: Results table displays filtered data

### Scenario 4: JOIN Operation
1. Select main table (e.g., "users")
2. Click "+ JOIN" button
3. Select join type: "INNER"
4. Select target table: "orders"
5. Select source column: "id"
6. Select target column: "user_id"
7. Click "Add JOIN"
8. Execute query
9. **Expected**: Results show combined data from both tables

### Scenario 5: Backend Webhook
1. Build a query with conditions
2. Click "📤 Send to Backend"
3. **Expected**: Success alert, data loaded from backend response

### Scenario 6: Pagination
1. Execute query with >10 results
2. Verify pagination controls appear
3. Click page "2"
4. Change "Rows per page" to 25
5. **Expected**: Display updates, page resets to 1 when changing items per page

### Scenario 7: Error Handling
1. Clear Supabase credentials
2. Reload application
3. **Expected**: Red error banner with connection failure message
4. Try to execute query without selecting table
5. **Expected**: Error message "Please select a table first!"

## Test Coverage Goals

| Category | Target Coverage | Current Status |
|----------|----------------|----------------|
| Components | 80%+ | ✅ Achieved |
| Utilities | 90%+ | ✅ Achieved |
| Integration | 70%+ | ✅ Achieved |
| Overall | 75%+ | 🎯 Target |

## Known Testing Limitations

1. **Supabase Mocking**: Some tests use mocked Supabase client. For full integration testing, use test database.
2. **UI Tests**: Component tests use Testing Library. Consider adding Cypress/Playwright for E2E.
3. **Backend Webhook**: Tests mock fetch API. Actual webhook testing requires running backend.

## Future Test Enhancements

### Planned Additions:
- [ ] E2E tests with Playwright
- [ ] Visual regression testing
- [ ] Performance benchmarks
- [ ] Load testing for large datasets
- [ ] Accessibility audit tests
- [ ] Browser compatibility tests

### Test Data Requirements:
For complete testing, create test database with:
- **Tables**: users, orders, products, categories
- **Sample Data**: 100+ records per table
- **Relationships**: Foreign keys for JOIN testing
- **RPC Functions**: get_tables_list(), get_table_columns()

## Continuous Integration

### GitHub Actions Workflow (Recommended)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## Troubleshooting Tests

### Common Issues:

**Tests fail with "Cannot find module"**
```bash
# Solution: Install dependencies
npm install
```

**Supabase environment variables not found**
```bash
# Solution: Ensure jest.setup.js mocks are loaded
# Check jest.config.js setupFilesAfterEnv
```

**Component tests timeout**
```bash
# Solution: Increase Jest timeout
jest.setTimeout(10000);
```

## Contributing Tests

When adding new features:
1. Write tests BEFORE implementation (TDD approach)
2. Ensure coverage >80% for new code
3. Include both happy path and error scenarios
4. Document test cases in this file
5. Run full test suite before committing

## Test Commands Reference

```bash
# Run specific test file
npm test -- Pagination.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="JOIN"

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u

# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

**Last Updated**: November 18, 2025  
**Test Framework**: Jest 29.7.0  
**Testing Library**: React Testing Library 14.1.2
