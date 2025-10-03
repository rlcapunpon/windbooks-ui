import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock AuthContext
const mockLogin = vi.fn()
vi.mock('../../contexts/AuthContextTypes', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}))

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockClear()
    mockLogin.mockClear()
  })

  describe('Reset Password Link', () => {
    it('should display Reset Password link across from Remember me checkbox', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      // Should show Reset Password link
      expect(screen.getByText('Reset Password')).toBeInTheDocument()
    })

    it('should navigate to reset password page when Reset Password link is clicked', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const resetPasswordLink = screen.getByText('Reset Password')
      
      // Check that the link has the correct href
      expect(resetPasswordLink).toHaveAttribute('href', '/auth/reset-password')
    })
  })
})