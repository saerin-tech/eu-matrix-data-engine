import '@testing-library/jest-dom'

// Mock environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = 'test-anon-key'

// Mock window.alert
global.alert = jest.fn()

// Mock fetch API
global.fetch = jest.fn()
