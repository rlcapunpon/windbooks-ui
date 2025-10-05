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
let mockUseParams = vi.fn(() => ({ code: 'a1b2c3d4e5f67890abcd1234567890ab' }));

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
    mockUseParams.mockReturnValue({ code: undefined as string | undefined });

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
});