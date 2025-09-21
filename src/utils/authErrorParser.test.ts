import { describe, it, expect } from 'vitest';
import { parseAuthError } from './authErrorParser';

describe('Auth Error Parser', () => {
  it('should parse unverified user error', () => {
    const error = { message: 'User account is not active and unverified' };
    const result = parseAuthError(error);

    expect(result.type).toBe('unverified');
    expect(result.title).toBe('Account Not Verified');
    expect(result.message).toContain('check your email');
    expect(result.actionText).toBe('Resend Verification Email');
    expect(result.onAction).toBeDefined();
  });

  it('should parse verification failed error', () => {
    const error = { message: 'User account verification failed' };
    const result = parseAuthError(error);

    expect(result.type).toBe('unverified');
    expect(result.title).toBe('Account Not Verified');
  });

  it('should parse inactive account error', () => {
    const error = { message: 'User account is deactivated' };
    const result = parseAuthError(error);

    expect(result.type).toBe('inactive');
    expect(result.title).toBe('Account Deactivated');
  });

  it('should parse blocked account error', () => {
    const error = { message: 'User account is blocked' };
    const result = parseAuthError(error);

    expect(result.type).toBe('blocked');
    expect(result.title).toBe('Account Blocked');
  });

  it('should parse pending account error', () => {
    const error = { message: 'User account is pending' };
    const result = parseAuthError(error);

    expect(result.type).toBe('inactive');
    expect(result.title).toBe('Account Pending Approval');
  });

  it('should parse closed account error', () => {
    const error = { message: 'User account is closed' };
    const result = parseAuthError(error);

    expect(result.type).toBe('blocked');
    expect(result.title).toBe('Account Closed');
  });

  it('should parse invalid credentials error', () => {
    const error = { message: 'Invalid credentials' };
    const result = parseAuthError(error);

    expect(result.type).toBe('credentials');
    expect(result.title).toBe('Invalid Credentials');
  });

  it('should parse user doesn\'t exist error', () => {
    const error = { message: 'User doesn\'t exist' };
    const result = parseAuthError(error);

    expect(result.type).toBe('credentials');
    expect(result.title).toBe('Invalid Credentials');
  });

  it('should parse token errors', () => {
    const error = { message: 'Invalid token' };
    const result = parseAuthError(error);

    expect(result.type).toBe('generic');
    expect(result.title).toBe('Authentication Error');
  });

  it('should parse no token provided error', () => {
    const error = { message: 'No token provided' };
    const result = parseAuthError(error);

    expect(result.type).toBe('generic');
    expect(result.title).toBe('Authentication Error');
  });

  it('should parse network errors', () => {
    const error = { message: 'Network Error', code: 'NETWORK_ERROR' };
    const result = parseAuthError(error);

    expect(result.type).toBe('network');
    expect(result.title).toBe('Connection Error');
  });

  it('should parse timeout errors', () => {
    const error = { message: 'timeout' };
    const result = parseAuthError(error);

    expect(result.type).toBe('network');
    expect(result.title).toBe('Connection Error');
  });

  it('should parse user already exists error', () => {
    const error = { message: 'User already exists' };
    const result = parseAuthError(error);

    expect(result.type).toBe('generic');
    expect(result.title).toBe('Account Already Exists');
  });

  it('should parse errors from response data', () => {
    const error = {
      response: {
        data: { message: 'Invalid credentials' }
      }
    };
    const result = parseAuthError(error);

    expect(result.type).toBe('credentials');
    expect(result.title).toBe('Invalid Credentials');
  });

  it('should provide generic fallback for unknown errors', () => {
    const error = { message: 'Some unknown error' };
    const result = parseAuthError(error);

    expect(result.type).toBe('generic');
    expect(result.title).toBe('Login Failed');
    expect(result.message).toBe('Some unknown error');
  });

  it('should handle errors without message', () => {
    const error = {};
    const result = parseAuthError(error);

    expect(result.type).toBe('generic');
    expect(result.title).toBe('Login Failed');
    expect(result.message).toBe('An unexpected error occurred');
  });
});