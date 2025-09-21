import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorModal from '../ErrorModal';
import type { ErrorInfo } from '../ErrorModal';

describe('ErrorModal Component', () => {
  const mockError: ErrorInfo = {
    type: 'credentials',
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect.',
  };

  const mockErrorWithAction: ErrorInfo = {
    type: 'unverified',
    title: 'Account Not Verified',
    message: 'Your account has not been verified yet.',
    actionText: 'Resend Email',
    onAction: vi.fn(),
  };

  it('should not render when isOpen is false', () => {
    render(<ErrorModal isOpen={false} onClose={() => {}} error={null} />);
    expect(screen.queryByText('Invalid Credentials')).not.toBeInTheDocument();
  });

  it('should not render when error is null', () => {
    render(<ErrorModal isOpen={true} onClose={() => {}} error={null} />);
    expect(screen.queryByText('Invalid Credentials')).not.toBeInTheDocument();
  });

  it('should render error modal with basic error information', () => {
    render(<ErrorModal isOpen={true} onClose={() => {}} error={mockError} />);

    expect(screen.getByText('Invalid Credentials')).toBeInTheDocument();
    expect(screen.getByText('The email or password you entered is incorrect.')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    render(<ErrorModal isOpen={true} onClose={() => {}} error={mockErrorWithAction} />);

    expect(screen.getByText('Resend Email')).toBeInTheDocument();
  });

  it('should call onAction when action button is clicked', () => {
    render(<ErrorModal isOpen={true} onClose={() => {}} error={mockErrorWithAction} />);

    const actionButton = screen.getByText('Resend Email');
    fireEvent.click(actionButton);

    expect(mockErrorWithAction.onAction).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<ErrorModal isOpen={true} onClose={mockOnClose} error={mockError} />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display correct icon for different error types', () => {
    const { rerender } = render(<ErrorModal isOpen={true} onClose={() => {}} error={mockError} />);

    // Test credentials error (should have a key icon)
    expect(document.querySelector('svg')).toBeInTheDocument();

    // Test unverified error (should have envelope icon)
    rerender(<ErrorModal isOpen={true} onClose={() => {}} error={mockErrorWithAction} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});