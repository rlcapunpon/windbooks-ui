import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PasswordUpdateSuggestionModal } from './PasswordUpdateSuggestionModal';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PasswordUpdateSuggestionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    userRole: 'USER' as const,
    lastUpdateDays: 95,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (props = defaultProps) => {
    return render(
      <BrowserRouter>
        <PasswordUpdateSuggestionModal {...props} />
      </BrowserRouter>
    );
  };

  describe('Modal Rendering', () => {
    it('should render when isOpen is true', () => {
      renderWithRouter();
      
      expect(screen.getByText('Password Update Recommended')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      renderWithRouter({ ...defaultProps, isOpen: false });
      
      expect(screen.queryByText('Password Update Recommended')).not.toBeInTheDocument();
    });
  });

  describe('Content for Regular Users', () => {
    it('should display appropriate message for regular users past 90 days', () => {
      renderWithRouter({
        ...defaultProps,
        userRole: 'USER',
        lastUpdateDays: 95,
      });
      
      expect(screen.getByText(/Your password was last updated 95 days ago/i)).toBeInTheDocument();
      expect(screen.getByText(/It's been over 90 days/i)).toBeInTheDocument();
    });

    it('should show "Update Password" button for regular users', () => {
      renderWithRouter();
      
      expect(screen.getByText('Update Password')).toBeInTheDocument();
    });

    it('should show "Later" button for regular users', () => {
      renderWithRouter();
      
      expect(screen.getByText('Later')).toBeInTheDocument();
    });
  });

  describe('Content for SUPERADMIN Users', () => {
    it('should display urgent message for SUPERADMIN users who never updated password', () => {
      renderWithRouter({
        ...defaultProps,
        userRole: 'SUPERADMIN',
        lastUpdateDays: null,
      });
      
      expect(screen.getByText(/You have never updated your password/i)).toBeInTheDocument();
      expect(screen.getByText(/For security reasons, please update your password immediately/i)).toBeInTheDocument();
    });

    it('should show "Update Password Now" button for SUPERADMIN users', () => {
      renderWithRouter({
        ...defaultProps,
        userRole: 'SUPERADMIN',
        lastUpdateDays: null,
      });
      
      expect(screen.getByText('Update Password Now')).toBeInTheDocument();
    });

    it('should not show "Later" button for SUPERADMIN users who never updated password', () => {
      renderWithRouter({
        ...defaultProps,
        userRole: 'SUPERADMIN',
        lastUpdateDays: null,
      });
      
      expect(screen.queryByText('Later')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Functionality', () => {
    it('should navigate to profile page when "Update Password" is clicked', () => {
      renderWithRouter();
      
      const updateButton = screen.getByText('Update Password');
      fireEvent.click(updateButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should navigate to profile page when "Update Password Now" is clicked for SUPERADMIN', () => {
      renderWithRouter({
        ...defaultProps,
        userRole: 'SUPERADMIN',
        lastUpdateDays: null,
      });
      
      const updateButton = screen.getByText('Update Password Now');
      fireEvent.click(updateButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should close modal when "Later" is clicked without navigation', () => {
      renderWithRouter();
      
      const laterButton = screen.getByText('Later');
      fireEvent.click(laterButton);
      
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should close modal when close button is clicked', () => {
      renderWithRouter();
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Styling and Accessibility', () => {
    it('should have proper modal styling classes', () => {
      renderWithRouter();
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center');
    });

    it('should have proper ARIA attributes', () => {
      renderWithRouter();
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-labelledby');
      expect(modal).toHaveAttribute('aria-describedby');
    });

    it('should focus on the modal when opened', () => {
      renderWithRouter();
      
      const modal = screen.getByRole('dialog');
      expect(document.activeElement).toBe(modal);
    });
  });

  describe('Different User Scenarios', () => {
    it('should handle USER role with null lastUpdateDays (never updated)', () => {
      renderWithRouter({
        ...defaultProps,
        userRole: 'USER',
        lastUpdateDays: null,
      });
      
      expect(screen.getByText(/You have never updated your password/i)).toBeInTheDocument();
      expect(screen.getByText('Update Password')).toBeInTheDocument();
      expect(screen.getByText('Later')).toBeInTheDocument();
    });

    it('should handle SUPERADMIN role with recent password update', () => {
      renderWithRouter({
        ...defaultProps,
        userRole: 'SUPERADMIN',
        lastUpdateDays: 30,
      });
      
      expect(screen.getByText(/Your password was last updated 30 days ago/i)).toBeInTheDocument();
      expect(screen.getByText('Update Password')).toBeInTheDocument();
      expect(screen.getByText('Later')).toBeInTheDocument();
    });
  });
});