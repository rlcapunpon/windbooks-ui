import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ResetPassword from './ResetPassword'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  describe('Page Structure', () => {
    it('should render reset password form', () => {
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      )

      expect(screen.getByText('Reset Password')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send Reset Email' })).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('should call reset password API when form is submitted', async () => {
      const user = userEvent.setup()

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: 'Send Reset Email' })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      // Should call the reset password API
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/user/auth/reset-password/request/email'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com' })
        })
      )
    })

    it('should show success message when reset email is sent successfully', async () => {
      const user = userEvent.setup()
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Reset email sent successfully' })
      })

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: 'Send Reset Email' })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password reset email sent successfully. Please check your email for instructions.')).toBeInTheDocument()
      })
    })

    it('should show error message when API call fails', async () => {
      const user = userEvent.setup()
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: 'Send Reset Email' })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('should have Back to Login link at top left', () => {
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      )

      const loginLink = screen.getByText(/back to login/i)
      expect(loginLink).toHaveAttribute('href', '/auth/login')
    })

    it('should have Back to Home link at top right', () => {
      render(
        <BrowserRouter>
          <ResetPassword />
        </BrowserRouter>
      )

      const homeLink = screen.getByText(/back to home/i)
      expect(homeLink).toHaveAttribute('href', '/')
    })
  })
})
})