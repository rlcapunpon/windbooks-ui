import '@testing-library/jest-dom'
import { beforeEach, vi } from 'vitest'

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_BASE_URL: 'http://localhost:3000',
  DEV: true
}))

// Mock axios for tests
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}))

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})