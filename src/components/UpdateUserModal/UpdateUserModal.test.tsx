import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UpdateUserModal from './UpdateUserModal';
import type { UserDetails } from '../../api/auth';

// Mock the onClose and onSave functions
const mockOnClose = vi.fn();
const mockOnSave = vi.fn();

const mockUserDetails: UserDetails = {
  firstName: 'John',
  lastName: 'Doe',
  nickName: 'Johnny',
  contactNumber: '+1234567890',
  reportTo: {
    id: '1',
    email: 'manager@example.com',
    firstName: 'Manager',
    lastName: 'User',
    nickName: 'Boss',
  },
};

describe('UpdateUserModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Validation', () => {
    it('should show validation errors when submitting with empty First Name', async () => {
      render(
        <UpdateUserModal
          user={mockUserDetails}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Clear the first name field
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      fireEvent.change(firstNameInput, { target: { value: '' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitButton);

      // Should show validation error for First Name
      await waitFor(() => {
        expect(screen.getByText('First Name is required')).toBeInTheDocument();
      });

      // Should not call onSave
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should show validation errors when submitting with empty Last Name', async () => {
      render(
        <UpdateUserModal
          user={mockUserDetails}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Clear the last name field
      const lastNameInput = screen.getByPlaceholderText('Enter your last name');
      fireEvent.change(lastNameInput, { target: { value: '' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitButton);

      // Should show validation error for Last Name
      await waitFor(() => {
        expect(screen.getByText('Last Name is required')).toBeInTheDocument();
      });

      // Should not call onSave
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should show validation errors when submitting with empty Nickname', async () => {
      render(
        <UpdateUserModal
          user={mockUserDetails}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Clear the nickname field
      const nickNameInput = screen.getByPlaceholderText('Enter your nickname');
      fireEvent.change(nickNameInput, { target: { value: '' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitButton);

      // Should show validation error for Nickname
      await waitFor(() => {
        expect(screen.getByText('Nickname is required')).toBeInTheDocument();
      });

      // Should not call onSave
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should show validation errors when submitting with empty Contact Number', async () => {
      render(
        <UpdateUserModal
          user={mockUserDetails}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Clear the contact number field
      const contactNumberInput = screen.getByPlaceholderText('Enter your contact number');
      fireEvent.change(contactNumberInput, { target: { value: '' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitButton);

      // Should show validation error for Contact Number
      await waitFor(() => {
        expect(screen.getByText('Contact Number is required')).toBeInTheDocument();
      });

      // Should not call onSave
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should show multiple validation errors when submitting with multiple empty fields', async () => {
      render(
        <UpdateUserModal
          user={mockUserDetails}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Clear all required fields
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      const lastNameInput = screen.getByPlaceholderText('Enter your last name');
      const nickNameInput = screen.getByPlaceholderText('Enter your nickname');
      const contactNumberInput = screen.getByPlaceholderText('Enter your contact number');

      fireEvent.change(firstNameInput, { target: { value: '' } });
      fireEvent.change(lastNameInput, { target: { value: '' } });
      fireEvent.change(nickNameInput, { target: { value: '' } });
      fireEvent.change(contactNumberInput, { target: { value: '' } });

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitButton);

      // Should show validation errors for all required fields
      await waitFor(() => {
        expect(screen.getByText('First Name is required')).toBeInTheDocument();
        expect(screen.getByText('Last Name is required')).toBeInTheDocument();
        expect(screen.getByText('Nickname is required')).toBeInTheDocument();
        expect(screen.getByText('Contact Number is required')).toBeInTheDocument();
      });

      // Should not call onSave
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should call onSave when all required fields are filled', async () => {
      render(
        <UpdateUserModal
          user={mockUserDetails}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Submit the form with all fields filled (they start with values from mockUserDetails)
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitButton);

      // Should call onSave with the user details
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          nickName: 'Johnny',
          contactNumber: '+1234567890',
        });
      });
    });

    it('should clear validation errors when user starts typing in a field', async () => {
      render(
        <UpdateUserModal
          user={mockUserDetails}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      // Clear the first name field and submit to show error
      const firstNameInput = screen.getByPlaceholderText('Enter your first name');
      fireEvent.change(firstNameInput, { target: { value: '' } });

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText('First Name is required')).toBeInTheDocument();
      });

      // Start typing in the field
      fireEvent.change(firstNameInput, { target: { value: 'J' } });

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('First Name is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should render modal with correct title', () => {
      render(
        <UpdateUserModal
          user={mockUserDetails}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Update User Details')).toBeInTheDocument();
    });

    it('should call onClose when cancel button is clicked', () => {
      render(
        <UpdateUserModal
          user={mockUserDetails}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should pre-populate form fields with user data', () => {
      render(
        <UpdateUserModal
          user={mockUserDetails}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    });
  });
});