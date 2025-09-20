import type { User } from '../api/auth';

export const COOKIE_NAMES = {
  USER_DATA: 'windbooks_user_data',
  ACCESS_TOKEN: 'windbooks_access_token',
  REFRESH_TOKEN: 'windbooks_refresh_token',
} as const;

export const COOKIE_OPTIONS = {
  httpOnly: false, // Allow JavaScript access
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class CookieStorage {
  static setUserData(user: User): void {
    const userData = JSON.stringify(user);
    document.cookie = `${COOKIE_NAMES.USER_DATA}=${encodeURIComponent(userData)}; max-age=${COOKIE_OPTIONS.maxAge}; path=/; samesite=${COOKIE_OPTIONS.sameSite}`;
  }

  static getUserData(): User | null {
    const cookies = document.cookie.split(';');
    const userCookie = cookies.find(cookie => cookie.trim().startsWith(`${COOKIE_NAMES.USER_DATA}=`));

    if (!userCookie) return null;

    try {
      const userData = userCookie.split('=')[1];
      return JSON.parse(decodeURIComponent(userData));
    } catch (error) {
      console.error('Failed to parse user data from cookie:', error);
      return null;
    }
  }

  static clearUserData(): void {
    document.cookie = `${COOKIE_NAMES.USER_DATA}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  static setToken(token: string, type: 'access' | 'refresh'): void {
    const cookieName = type === 'access' ? COOKIE_NAMES.ACCESS_TOKEN : COOKIE_NAMES.REFRESH_TOKEN;
    document.cookie = `${cookieName}=${token}; max-age=${COOKIE_OPTIONS.maxAge}; path=/; samesite=${COOKIE_OPTIONS.sameSite}`;
  }

  static getToken(type: 'access' | 'refresh'): string | null {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${type === 'access' ? COOKIE_NAMES.ACCESS_TOKEN : COOKIE_NAMES.REFRESH_TOKEN}=`));

    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }

  static clearTokens(): void {
    document.cookie = `${COOKIE_NAMES.ACCESS_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${COOKIE_NAMES.REFRESH_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  static clearAll(): void {
    this.clearUserData();
    this.clearTokens();
  }
}