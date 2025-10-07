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

  describe('Modal Behavior', () => {
    it('should not render when isOpen is false', () => {
      render(<ChangePasswordModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      render(<ChangePasswordModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(<ChangePasswordModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });
});