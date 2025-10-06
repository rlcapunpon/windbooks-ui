import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VerifyEmail from './VerifyEmail';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigate
const mockNavigate = vi.fn();

// Mock useParams - defined before the mock
let mockUseParams = vi.fn();

// Mock window.alert
const mockAlert = vi.fn();
global.alert = mockAlert;
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

describe('VerifyEmail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUseParams.mockReturnValue({ code: 'a1b2c3d4e5f67890abcd1234567890ab' });

    // Clear document for theme tests
    document.head.innerHTML = '';
    document.body.innerHTML = '';

    // Manually inject the CSS custom properties from theme.css
    const style = document.createElement('style');
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
    `;
    document.head.appendChild(style);
  });

  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );

    expect(screen.getByText('Verifying your email...')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('should call verification API only once on successful verification', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/verify/a1b2c3d4e5f67890abcd1234567890ab',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('should call verification API only once on failed verification', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Invalid code'),
    });

    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/verify/a1b2c3d4e5f67890abcd1234567890ab',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('should redirect to home when no verification code is provided', () => {
    mockUseParams.mockReturnValue({ code: undefined });

    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should redirect to home when verification code has invalid format', () => {
    mockUseParams.mockReturnValue({ code: 'invalid-code' });

    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  describe('Theme Usage', () => {
    it('uses text-heading class for success heading', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(
        <BrowserRouter>
          <VerifyEmail />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Email Verified!')).toBeInTheDocument();
      });

      const heading = screen.getByRole('heading', { name: 'Email Verified!' });
      expect(heading).toHaveClass('text-heading');
    });

    it('uses text-heading class for error heading', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Invalid code'),
      });

      render(
        <BrowserRouter>
          <VerifyEmail />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      });

      const heading = screen.getByRole('heading', { name: 'Verification Failed' });
      expect(heading).toHaveClass('text-heading');
    });

    it('uses btn-primary class for success button', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      render(
        <BrowserRouter>
          <VerifyEmail />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Email Verified!')).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: 'Go to Login' });
      expect(button).toHaveClass('btn-primary');
    });

    it('uses btn-primary class for resend button', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Invalid code'),
      });

      render(
        <BrowserRouter>
          <VerifyEmail />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: 'Resend Verification Email' });
      expect(button).toHaveClass('btn-primary');
    });

    it('uses form-input class for email input in error state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Invalid code'),
      });

      render(
        <BrowserRouter>
          <VerifyEmail />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toHaveClass('form-input');
    });
  });
});