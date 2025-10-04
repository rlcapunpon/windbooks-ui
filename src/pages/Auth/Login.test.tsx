import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockLocation = { state: null as any }
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation
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

  describe('Verification Toast', () => {
    it('should show verification toast when location state has showVerificationMessage', () => {
      mockLocation.state = { showVerificationMessage: true }
      
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      expect(screen.getByText(/Please verify your email/)).toBeInTheDocument()
      expect(screen.getByText(/We’ve sent a verification link/)).toBeInTheDocument()
    })

    it('should not show verification toast when location state does not have showVerificationMessage', () => {
      mockLocation.state = null
      
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      expect(screen.queryByText(/Please verify your email/)).not.toBeInTheDocument()
    })
  })
})