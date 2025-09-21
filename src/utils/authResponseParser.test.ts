import { describe, it, expect } from 'vitest';
import { parseAuthResponse } from './authResponseParser';

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
    expect((result.data as any).type).toBe('warning');
    expect((result.data as any).title).toBe('Email Verification Required');
    expect((result.data as any).message).toContain('verification link');
    expect((result.data as any).actionText).toBe('Resend Verification Email');
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
    expect((result.data as any).type).toBe('credentials');
    expect((result.data as any).title).toBe('Invalid Credentials');
  });

  it('should return error for non-401 unverified errors', () => {
    const error = { message: 'User account verification failed' };

    const result = parseAuthResponse(error);

    expect(result.type).toBe('error');
    expect((result.data as any).type).toBe('unverified');
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