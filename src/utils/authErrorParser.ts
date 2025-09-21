import type { ErrorInfo } from '../components/ErrorModal/ErrorModal';

/**
 * Parses authentication error messages and returns structured error information
 */
export function parseAuthError(error: any): ErrorInfo {
  const message = error?.message || error?.response?.data?.message || 'An unexpected error occurred';

  // Handle unverified user errors
  if (message.includes('unverified') || message.includes('verification failed')) {
    return {
      type: 'unverified',
      title: 'Account Not Verified',
      message: 'Your account has not been verified yet. Please check your email for a verification link that was sent to you during registration.',
      actionText: 'Resend Verification Email',
      onAction: () => {
        // TODO: Implement resend verification email functionality
        console.log('Resend verification email requested');
      }
    };
  }

  // Handle inactive/blocked account errors
  if (message.includes('not active') || message.includes('account is deactivated')) {
    return {
      type: 'inactive',
      title: 'Account Deactivated',
      message: 'Your account has been deactivated. Please contact your administrator to reactivate your account.',
    };
  }

  if (message.includes('account is blocked')) {
    return {
      type: 'blocked',
      title: 'Account Blocked',
      message: 'Your account has been blocked due to security concerns. Please contact support for assistance.',
    };
  }

  if (message.includes('account is pending')) {
    return {
      type: 'inactive',
      title: 'Account Pending Approval',
      message: 'Your account is pending approval from an administrator. You will receive an email once your account is activated.',
    };
  }

  if (message.includes('account is closed')) {
    return {
      type: 'blocked',
      title: 'Account Closed',
      message: 'Your account has been closed. If you believe this is an error, please contact support.',
    };
  }

  // Handle credential errors
  if (message.includes('Invalid credentials') || message.includes('User doesn\'t exist')) {
    return {
      type: 'credentials',
      title: 'Invalid Credentials',
      message: 'The email or password you entered is incorrect. Please check your credentials and try again.',
    };
  }

  // Handle token-related errors
  if (message.includes('No token provided') || message.includes('Invalid token') || message.includes('token is invalid')) {
    return {
      type: 'generic',
      title: 'Authentication Error',
      message: 'Your session has expired. Please log in again.',
    };
  }

  // Handle network/server errors
  if (message.includes('Network Error') || message.includes('timeout') || error?.code === 'NETWORK_ERROR') {
    return {
      type: 'network',
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
    };
  }

  // Handle user already exists (registration)
  if (message.includes('User already exists')) {
    return {
      type: 'generic',
      title: 'Account Already Exists',
      message: 'An account with this email address already exists. Please try logging in instead.',
    };
  }

  // Generic fallback
  return {
    type: 'generic',
    title: 'Login Failed',
    message: message,
  };
}