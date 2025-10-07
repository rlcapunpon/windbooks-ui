import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ChangePasswordModal from './ChangePasswordModal';

// Mock the tokenStorage utility
vi.mock('../../utils/tokenStorage', () => ({
  getAccessToken: vi.fn(() => 'mock-token'),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ChangePasswordModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    isSuperAdmin: false,
    userId: 'test-user-id',
    userEmail: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('API Endpoint (10-07-25.Step4)', () => {
    it('should call the correct API endpoint /api/user/update/password when updating password', async () => {
      const user = userEvent.setup();

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Password updated successfully' }),
      });

      render(<ChangePasswordModal {...defaultProps} />);

      // Fill out the form
      await user.type(screen.getByLabelText('Current Password'), 'currentPass123');
      await user.type(screen.getByLabelText('New Password'), 'newPassword123');
      await user.type(screen.getByLabelText('Confirm New Password'), 'newPassword123');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Update Password' });
      await user.click(submitButton);

      // Verify the API call was made to the correct endpoint
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/user/update/password'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-token',
            }),
            body: expect.any(String),
          })
        );
      });
    });

    it('should call the correct API endpoint for superadmin updating another user password', async () => {
      const user = userEvent.setup();

      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Password updated successfully' }),
      });

      render(<ChangePasswordModal {...defaultProps} isSuperAdmin={true} />);

      // Fill out the form including user email for superadmin
      const userEmailInput = screen.getByLabelText('User Email');
      await user.clear(userEmailInput);
      await user.type(userEmailInput, 'target@example.com');
      await user.type(screen.getByLabelText('Current Password'), 'currentPass123');
      await user.type(screen.getByLabelText('New Password'), 'newPassword123');
      await user.type(screen.getByLabelText('Confirm New Password'), 'newPassword123');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: 'Update Password' });
      await user.click(submitButton);

      // Verify the API call was made to the correct endpoint
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/user/update/password'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer mock-token',
            }),
            body: expect.any(String),
          })
        );
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when passwords do not match', async () => {
      const user = userEvent.setup();

      render(<ChangePasswordModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Current Password'), 'currentPass123');
      await user.type(screen.getByLabelText('New Password'), 'newPassword123');
      await user.type(screen.getByLabelText('Confirm New Password'), 'differentPassword123');

      const submitButton = screen.getByRole('button', { name: 'Update Password' });
      await user.click(submitButton);

      expect(screen.getByText('New password confirmation does not match.')).toBeInTheDocument();
    });

    it('should show error when new password is too short', async () => {
      const user = userEvent.setup();

      render(<ChangePasswordModal {...defaultProps} />);

      await user.type(screen.getByLabelText('Current Password'), 'currentPass123');
      await user.type(screen.getByLabelText('New Password'), 'short');
      await user.type(screen.getByLabelText('Confirm New Password'), 'short');

      const submitButton = screen.getByRole('button', { name: 'Update Password' });
      await user.click(submitButton);

      expect(screen.getByText('New password must be at least 8 characters long.')).toBeInTheDocument();
    });
  });

  describe('Password Peek Functionality (10-07-25.Step5)', () => {
    it('should display eye icons for all password input fields', () => {
      render(<ChangePasswordModal {...defaultProps} />);

      // Check that eye icons are present for all password fields
      const eyeIcons = screen.getAllByRole('button', { name: /toggle .* password visibility/i });
      expect(eyeIcons).toHaveLength(3); // currentPassword, newPassword, newPasswordConfirmation
    });

    it('should toggle current password visibility when eye icon is clicked', async () => {
      const user = userEvent.setup();
      render(<ChangePasswordModal {...defaultProps} />);

      const currentPasswordInput = screen.getByLabelText('Current Password');
      const eyeIcon = screen.getByRole('button', { name: /toggle current password visibility/i });

      // Initially should be password type
      expect(currentPasswordInput).toHaveAttribute('type', 'password');

      // Click eye icon to show password
      await user.click(eyeIcon);
      expect(currentPasswordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(eyeIcon);
      expect(currentPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should toggle new password visibility when eye icon is clicked', async () => {
      const user = userEvent.setup();
      render(<ChangePasswordModal {...defaultProps} />);

      const newPasswordInput = screen.getByLabelText('New Password');
      const eyeIcon = screen.getByRole('button', { name: /toggle new password visibility/i });

      // Initially should be password type
      expect(newPasswordInput).toHaveAttribute('type', 'password');

      // Click eye icon to show password
      await user.click(eyeIcon);
      expect(newPasswordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(eyeIcon);
      expect(newPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should toggle confirm password visibility when eye icon is clicked', async () => {
      const user = userEvent.setup();
      render(<ChangePasswordModal {...defaultProps} />);

      const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
      const eyeIcon = screen.getByRole('button', { name: /toggle confirm password visibility/i });

      // Initially should be password type
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Click eye icon to show password
      await user.click(eyeIcon);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(eyeIcon);
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should maintain independent visibility state for each password field', async () => {
      const user = userEvent.setup();
      render(<ChangePasswordModal {...defaultProps} />);

      const currentPasswordInput = screen.getByLabelText('Current Password');
      const newPasswordInput = screen.getByLabelText('New Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password');

      const currentEyeIcon = screen.getByRole('button', { name: /toggle current password visibility/i });
      const newEyeIcon = screen.getByRole('button', { name: /toggle new password visibility/i });
      const confirmEyeIcon = screen.getByRole('button', { name: /toggle confirm password visibility/i });

      // All should start as password type
      expect(currentPasswordInput).toHaveAttribute('type', 'password');
      expect(newPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Show current password
      await user.click(currentEyeIcon);
      expect(currentPasswordInput).toHaveAttribute('type', 'text');
      expect(newPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Show new password
      await user.click(newEyeIcon);
      expect(currentPasswordInput).toHaveAttribute('type', 'text');
      expect(newPasswordInput).toHaveAttribute('type', 'text');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Show confirm password
      await user.click(confirmEyeIcon);
      expect(currentPasswordInput).toHaveAttribute('type', 'text');
      expect(newPasswordInput).toHaveAttribute('type', 'text');
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      // Hide current password
      await user.click(currentEyeIcon);
      expect(currentPasswordInput).toHaveAttribute('type', 'password');
      expect(newPasswordInput).toHaveAttribute('type', 'text');
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    it('should display eye-slash icon when password is visible', async () => {
      const user = userEvent.setup();
      render(<ChangePasswordModal {...defaultProps} />);

      const eyeIcon = screen.getByRole('button', { name: /toggle current password visibility/i });

      // Initially should show eye icon (password hidden)
      expect(eyeIcon).toContainHTML('d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"');

      // Click to show password
      await user.click(eyeIcon);
      expect(eyeIcon).toContainHTML('d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"');

      // Click again to hide password
      await user.click(eyeIcon);
      expect(eyeIcon).toContainHTML('d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"');
    });
  });
});