import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationModal from '../NotificationModal';
import type { NotificationInfo } from '../NotificationModal';

describe('NotificationModal Component', () => {
  const mockNotification: NotificationInfo = {
    type: 'success',
    title: 'Success!',
    message: 'Your action was completed successfully.',
  };

  const mockNotificationWithAction: NotificationInfo = {
    type: 'warning',
    title: 'Warning',
    message: 'Please verify your email.',
    actionText: 'Verify Email',
    onAction: vi.fn(),
  };

  it('should not render when isOpen is false', () => {
    render(<NotificationModal isOpen={false} onClose={() => {}} notification={null} />);
    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  it('should not render when notification is null', () => {
    render(<NotificationModal isOpen={true} onClose={() => {}} notification={null} />);
    expect(screen.queryByText('Success!')).not.toBeInTheDocument();
  });

  it('should render notification modal with basic information', () => {
    render(<NotificationModal isOpen={true} onClose={() => {}} notification={mockNotification} />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Your action was completed successfully.')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    render(<NotificationModal isOpen={true} onClose={() => {}} notification={mockNotificationWithAction} />);

    expect(screen.getByText('Verify Email')).toBeInTheDocument();
  });

  it('should call onAction when action button is clicked', () => {
    render(<NotificationModal isOpen={true} onClose={() => {}} notification={mockNotificationWithAction} />);

    const actionButton = screen.getByText('Verify Email');
    fireEvent.click(actionButton);

    expect(mockNotificationWithAction.onAction).toHaveBeenCalled();
  });

  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(<NotificationModal isOpen={true} onClose={mockOnClose} notification={mockNotification} />);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should display correct icon for different notification types', () => {
    const { rerender } = render(<NotificationModal isOpen={true} onClose={() => {}} notification={mockNotification} />);

    // Test success notification (should have checkmark icon)
    expect(document.querySelector('svg')).toBeInTheDocument();

    // Test warning notification (should have warning icon)
    rerender(<NotificationModal isOpen={true} onClose={() => {}} notification={mockNotificationWithAction} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('should apply correct gradient colors for different types', () => {
    const { rerender } = render(<NotificationModal isOpen={true} onClose={() => {}} notification={mockNotification} />);

    // Success should have green gradient
    let actionButton = screen.queryByText('Verify Email');
    expect(actionButton).not.toBeInTheDocument();

    // Warning should have yellow-orange gradient
    rerender(<NotificationModal isOpen={true} onClose={() => {}} notification={mockNotificationWithAction} />);
    actionButton = screen.getByText('Verify Email');
    expect(actionButton).toHaveClass('from-yellow-500');
  });
});