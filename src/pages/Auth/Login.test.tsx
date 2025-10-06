import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockLocation: { state: Record<string, unknown> | null } = { state: null }
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

    // Clear document for theme tests
    document.head.innerHTML = ''
    document.body.innerHTML = ''

    // Manually inject the CSS custom properties from theme.css
    const style = document.createElement('style')
    style.textContent = `
      :root {
        /* Primary green palette */
        --color-primary: #0ED977;
        --color-primary-hover: #0ED675;
        --color-primary-dark: #088D4D;

        /* Backgrounds */
        --color-background-primary: #FFFFFF;
        --color-background-secondary: #F9F9F9;
        --color-background-surface: #F9F9F9;

        /* Text colors */
        --color-text-primary: #231F20;
        --color-text-secondary: #231F20;
        --color-text-disabled: #A8EFC2;

        /* Border and dividers */
        --color-border: #E0E0E0;
        --color-divider: #E0E0E0;

        /* State colors */
        --color-state-success: #0ED977;
        --color-state-success-dark: #088D4D;
        --color-state-warning: #F59E0B;
        --color-state-error: #EF4444;

        /* Accent colors */
        --color-accent-light: #C7F9CC;
        --color-accent-dark: #073B27;

        /* Input colors */
        --color-input-background: #FFFFFF;
        --color-input-border: #E0E0E0;
        --color-input-focus: #0ED977;
      }

      .btn-primary {
        background-color: var(--color-primary);
        color: #FFFFFF;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 14px 0 rgba(14, 217, 119, 0.25);
      }

      .text-heading {
        color: var(--color-text-primary);
        font-weight: 700;
        font-size: 2rem;
        line-height: 1.2;
      }

      .form-input {
        background-color: var(--color-input-background);
        border: 2px solid var(--color-input-border);
        border-radius: 0.5rem;
        padding: 0.75rem;
        color: var(--color-text-primary);
        transition: all 0.3s ease;
      }

      .form-input:focus {
        outline: none;
        border-color: var(--color-input-focus);
        box-shadow: 0 0 0 3px rgba(14, 217, 119, 0.1);
      }
    `
    document.head.appendChild(style)
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

  describe('Theme Usage', () => {
    it('should use theme classes for the login button', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const loginButton = screen.getByRole('button', { name: /login/i })
      expect(loginButton).toHaveClass('btn-primary')
    })

    it('should use theme classes for form inputs', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')

      expect(emailInput).toHaveClass('form-input')
      expect(passwordInput).toHaveClass('form-input')
    })

    it('should use theme classes for the heading', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const heading = screen.getByRole('heading', { name: /login/i })
      expect(heading).toHaveClass('text-heading')
    })

    it('should use theme colors for background', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const mainContainer = document.querySelector('.min-h-screen')
      expect(mainContainer).toHaveClass('bg-background-primary')
    })
  })
})