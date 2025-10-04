import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Toast from './Toast';

describe('Toast', () => {
  it('renders the toast with the provided message', () => {
    render(<Toast message="Test message" isVisible={true} />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('does not render when isVisible is false', () => {
    render(<Toast message="Test message" isVisible={false} />);
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<Toast message="Test message" isVisible={true} />);
    
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('p-4', 'rounded-lg', 'shadow-lg', 'mb-4', 'bg-blue-500', 'text-white');
  });

  it('has proper accessibility attributes', () => {
    render(<Toast message="Test message" isVisible={true} />);
    
    const toast = screen.getByTestId('toast');
    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders the close button when onClose is provided', () => {
    render(<Toast message="Test message" isVisible={true} onClose={() => {}} />);
    
    expect(screen.getByRole('button', { name: 'Close notification' })).toBeInTheDocument();
  });

  it('does not render the close button when onClose is not provided', () => {
    render(<Toast message="Test message" isVisible={true} />);
    
    expect(screen.queryByRole('button', { name: 'Close notification' })).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    
    render(<Toast message="Test message" isVisible={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close notification' });
    await user.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});