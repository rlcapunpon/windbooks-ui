import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'

// Mock react-router-dom
const mockNavigate = vi.fn()
const mockLocation: { state: Record<string, unknown> | null; search: string } = { state: null, search: '' }
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
    mockLocation.state = null
    mockLocation.search = ''

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

  describe('Forgot Password Link', () => {
    it('should display Forgot Password? link across from Remember me checkbox', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      // Should show Forgot Password? link
      expect(screen.getByText('Forgot Password?')).toBeInTheDocument()
    })

    it('should navigate to reset password page when Forgot Password? link is clicked', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const resetPasswordLink = screen.getByText('Forgot Password?')
      
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

  describe('Expired Session Toast', () => {
    it('should show expired session toast when URL has e=login-expired query parameter', () => {
      mockLocation.search = '?e=login-expired'

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      expect(screen.getByText('User session expired. Please login again.')).toBeInTheDocument()
    })

    it('should not show expired session toast when URL does not have e=login-expired query parameter', () => {
      mockLocation.search = ''

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      expect(screen.queryByText('User session expired. Please login again.')).not.toBeInTheDocument()
    })

    it('should not show expired session toast when URL has different query parameter', () => {
      mockLocation.search = '?other=param'

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      expect(screen.queryByText('User session expired. Please login again.')).not.toBeInTheDocument()
    })

    it('should show expired session toast when URL has multiple query parameters including e=login-expired', () => {
      mockLocation.search = '?other=param&e=login-expired&another=value'

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      expect(screen.getByText('User session expired. Please login again.')).toBeInTheDocument()
    })
  })

  describe('Login Error Handling (10-07-25.Step6)', () => {
    it('should show correct error message for 401 invalid credentials instead of generic 401 error', async () => {
      const user = userEvent.setup()
      
      // Mock login to throw 401 invalid credentials error
      const invalidCredentialsError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      }
      mockLogin.mockRejectedValueOnce(invalidCredentialsError)

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      // Fill in the form
      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const loginButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(loginButton)

      // Should show ErrorModal with correct message, not generic 401 error
      expect(await screen.findByText('Invalid Credentials')).toBeInTheDocument()
      expect(screen.getByText('The email or password you entered is incorrect. Please check your credentials and try again.')).toBeInTheDocument()
      
      // Should not show generic 401 error
      expect(screen.queryByText('401')).not.toBeInTheDocument()
    })

    it('should show invalid credentials error for 401 status code even with axios default error message', async () => {
      const user = userEvent.setup()
      
      // Mock login to throw 401 error with axios default message
      const axios401Error = {
        message: 'Request failed with status code 401',
        response: {
          status: 401,
          data: {} // No specific message from API
        }
      }
      mockLogin.mockRejectedValueOnce(axios401Error)

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      // Fill in the form
      const emailInput = screen.getByPlaceholderText('Enter your email')
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const loginButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(loginButton)

      // Should show ErrorModal with invalid credentials message, not the axios error message
      expect(await screen.findByText('Invalid Credentials')).toBeInTheDocument()
      expect(screen.getByText('The email or password you entered is incorrect. Please check your credentials and try again.')).toBeInTheDocument()
      
      // Should not show the axios default error message
      expect(screen.queryByText('Request failed with status code 401')).not.toBeInTheDocument()
    })
  })

  describe('Password Peek Functionality', () => {
    it('should show password peek button in password field', () => {
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const passwordInput = screen.getByPlaceholderText('Enter your password')
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Should have eye icon button
      const peekButton = screen.getByRole('button', { name: /toggle password visibility/i })
      expect(peekButton).toBeInTheDocument()
    })

    it('should toggle password visibility when peek button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const peekButton = screen.getByRole('button', { name: /toggle password visibility/i })

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Click to show password
      await user.click(peekButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      // Click again to hide password
      await user.click(peekButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should show eye icon when password is hidden and eye-slash when visible', async () => {
      const user = userEvent.setup()

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )

      const peekButton = screen.getByRole('button', { name: /toggle password visibility/i })

      // Initially should show eye icon (password hidden)
      expect(peekButton).toContainHTML('M15 12a3 3 0 11-6 0 3 3 0 016 0z') // eye icon path

      // Click to show password - should show eye-slash icon
      await user.click(peekButton)
      expect(peekButton).toContainHTML('M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21') // eye-slash icon path

      // Click again to hide password - should show eye icon again
      await user.click(peekButton)
      expect(peekButton).toContainHTML('M15 12a3 3 0 11-6 0 3 3 0 016 0z')
    })
  })
})