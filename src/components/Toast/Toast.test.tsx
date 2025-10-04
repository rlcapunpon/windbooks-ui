import { render, screen } from '@testing-library/react';
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

  it('renders the verification message correctly', () => {
    const verificationMessage = "Please verify your email\nWe’ve sent a verification link to your registered email address. Kindly check your inbox (or spam folder) and click the link to activate your account.";
    
    render(<Toast message={verificationMessage} isVisible={true} />);
    
    expect(screen.getByText(/Please verify your email/)).toBeInTheDocument();
    expect(screen.getByText(/We’ve sent a verification link/)).toBeInTheDocument();
  });
});