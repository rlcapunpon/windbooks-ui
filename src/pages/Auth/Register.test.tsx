import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { AuthContext } from '../../contexts/AuthContextTypes';

// Mock the AuthContext
const mockRegister = vi.fn();
const mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
  register: mockRegister,
  isAuthenticated: false,
  isLoading: false,
};

vi.mock('../../contexts/AuthContextTypes', () => ({
  AuthContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  useAuth: () => mockAuthContext,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the registration form', () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <Register />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('shows validation errors for invalid form', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <Register />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: 'Register' });
    await user.click(submitButton);

    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it('calls register on valid form submission', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <Register />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    const submitButton = screen.getByRole('button', { name: 'Register' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');
    await user.click(submitButton);

    expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password123!');
  });

  it('shows verification message on successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <Register />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    const submitButton = screen.getByRole('button', { name: 'Register' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');
    await user.click(submitButton);

    expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password123!');
    expect(mockNavigate).toHaveBeenCalledWith('/auth/login', { state: { showVerificationMessage: true } });
  });

  it('navigates to login on successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <Register />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
    const submitButton = screen.getByRole('button', { name: 'Register' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.type(confirmPasswordInput, 'Password123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth/login', { state: { showVerificationMessage: true } });
    });
  });
});