import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { AuthContext } from '../../contexts/AuthContextTypes';

// Mock the AuthContext
const mockRegister = vi.fn();
let mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
  register: mockRegister,
  isAuthenticated: false,
  isLoading: false,
  isPasswordModalOpen: false,
  passwordModalProps: null,
  closePasswordModal: vi.fn(),
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

  describe('Theme Usage', () => {
    it('uses btn-primary class for submit button', () => {
      render(
        <BrowserRouter>
          <AuthContext.Provider value={mockAuthContext}>
            <Register />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      const submitButton = screen.getByRole('button', { name: 'Register' });
      expect(submitButton).toHaveClass('btn-primary');
    });

    it('uses text-heading class for page heading', () => {
      render(
        <BrowserRouter>
          <AuthContext.Provider value={mockAuthContext}>
            <Register />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      const heading = screen.getByRole('heading', { name: 'Register' });
      expect(heading).toHaveClass('text-heading');
    });

    it('uses form-input class for email input', () => {
      render(
        <BrowserRouter>
          <AuthContext.Provider value={mockAuthContext}>
            <Register />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toHaveClass('form-input');
    });

    it('uses form-input class for password inputs', () => {
      render(
        <BrowserRouter>
          <AuthContext.Provider value={mockAuthContext}>
            <Register />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');

      expect(passwordInput).toHaveClass('form-input');
      expect(confirmPasswordInput).toHaveClass('form-input');
    });
  });

  describe('Authenticated User Redirection (10-08-25.Step1)', () => {
    it('should redirect authenticated user to dashboard', () => {
      // Mock authenticated user
      mockAuthContext.user = {
        id: 'test-user-id',
        email: 'test@example.com',
        isActive: true,
        isSuperAdmin: false,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        details: {
          firstName: 'John',
          lastName: 'Doe',
          nickName: 'Johnny',
          contactNumber: '+1-555-0123',
          reportTo: {
            id: 'manager-id',
            email: 'manager@example.com',
            firstName: 'Jane',
            lastName: 'Manager',
            nickName: 'Manager'
          }
        },
        resources: []
      };
      mockAuthContext.isLoading = false;

      render(
        <BrowserRouter>
          <AuthContext.Provider value={mockAuthContext}>
            <Register />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      // Should redirect to dashboard
      expect(mockNavigate).toHaveBeenCalledWith('/user');
    });

    it('should not redirect unauthenticated user', () => {
      // Mock unauthenticated user
      mockAuthContext.user = null;
      mockAuthContext.isLoading = false;

      render(
        <BrowserRouter>
          <AuthContext.Provider value={mockAuthContext}>
            <Register />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      // Should not redirect
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not redirect while authentication is loading', () => {
      // Mock loading state
      mockAuthContext.user = null;
      mockAuthContext.isLoading = true;

      render(
        <BrowserRouter>
          <AuthContext.Provider value={mockAuthContext}>
            <Register />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      // Should not redirect while loading
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});