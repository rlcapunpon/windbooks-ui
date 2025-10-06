import { describe, it, expect } from 'vitest';
import { parseAuthResponse } from './authResponseParser';
import { ErrorInfo } from '../components/ErrorModal/ErrorModal';
import { NotificationInfo } from '../components/NotificationModal/NotificationModal';

describe('Auth Response Parser', () => {
  it('should return notification for 401 unverified account error', () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'User account is not active and unverified' }
      }
    };

    const result = parseAuthResponse(error);

    expect(result.type).toBe('notification');
    expect((result.data as NotificationInfo).type).toBe('warning');
    expect((result.data as NotificationInfo).title).toBe('Email Verification Required');
    expect((result.data as NotificationInfo).message).toContain('verification link');
    expect((result.data as NotificationInfo).actionText).toBe('Resend Verification Email');
  });

  it('should return error for other 401 errors', () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Invalid credentials' }
      }
    };

    const result = parseAuthResponse(error);

    expect(result.type).toBe('error');
    expect((result.data as ErrorInfo).type).toBe('credentials');
    expect((result.data as ErrorInfo).title).toBe('Invalid Credentials');
  });

  it('should return error for non-401 unverified errors', () => {
    const error = { message: 'User account verification failed' };

    const result = parseAuthResponse(error);

    expect(result.type).toBe('error');
    expect((result.data as ErrorInfo).type).toBe('unverified');
  });

  it('should handle errors from response data', () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'User account is not active and unverified' }
      }
    };

    const result = parseAuthResponse(error);

    expect(result.type).toBe('notification');
  });

  it('should handle errors without response structure', () => {
    const error = { message: 'Some error' };

    const result = parseAuthResponse(error);

    expect(result.type).toBe('error');
  });
});