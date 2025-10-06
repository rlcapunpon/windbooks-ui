const ACCESS_TOKEN_KEY = 'windbooks_access_token';
const REFRESH_TOKEN_KEY = 'windbooks_refresh_token';

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Decodes a JWT token and returns the payload
 */
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
};

/**
 * Analyzes JWT token size and payload structure
 */
export const analyzeToken = (token: string | null = null): void => {
  const tokenToAnalyze = token || getAccessToken();
  if (!tokenToAnalyze) {
    console.log('❌ No token to analyze');
    return;
  }

  const totalSize = tokenToAnalyze.length;
  const headerSize = `Bearer ${tokenToAnalyze}`.length;
  const parts = tokenToAnalyze.split('.');
  
  console.log('🔍 JWT Token Analysis:');
  console.log(`📏 Total token size: ${totalSize} characters (${(totalSize/1024).toFixed(1)}KB)`);
  console.log(`📏 Authorization header size: ${headerSize} characters (${(headerSize/1024).toFixed(1)}KB)`);
  console.log(`📊 Token parts: ${parts.length} (Header: ${parts[0]?.length}, Payload: ${parts[1]?.length}, Signature: ${parts[2]?.length})`);
  
  if (totalSize > 8000) {
    console.error('🚨 DANGER: Token exceeds 8KB - will cause 431 "Request Header Fields Too Large" errors');
    console.log('💡 POSSIBLE CAUSES:');
    console.log('   • Large user object embedded in JWT payload');
    console.log('   • Extensive permissions/roles list');
    console.log('   • Embedded certificates or keys');
    console.log('   • Large custom claims');
    console.log('🔧 SOLUTIONS:');
    console.log('   • Use token references instead of embedding large data');
    console.log('   • Implement token refresh with smaller payloads');
    console.log('   • Store large data server-side and use IDs');
    console.log('   • Reduce JWT expiration time');
  } else if (totalSize > 4000) {
    console.warn('⚠️ WARNING: Token is large (>4KB) - may cause issues on some servers');
  } else if (totalSize > 2000) {
    console.log('ℹ️ INFO: Token is moderately sized (>2KB)');
  } else {
    console.log('✅ Token size is within normal limits');
  }
  
  const payload = decodeJWT(tokenToAnalyze);
  if (payload) {
    console.log('📋 Payload structure:', {
      issuer: payload.iss,
      subject: payload.sub,
      audience: payload.aud,
      expires: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
      issued: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
      payloadSize: JSON.stringify(payload).length,
      keys: Object.keys(payload)
    });
    
    // Check for large payload components
    if (payload.permissions && Array.isArray(payload.permissions)) {
      console.log(`👥 Permissions count: ${payload.permissions.length}`);
      if (payload.permissions.length > 50) {
        console.warn('⚠️ Large permissions array may be contributing to token size');
      }
    }
    if (payload.roles && Array.isArray(payload.roles)) {
      console.log(`🎭 Roles count: ${payload.roles.length}`);
      if (payload.roles.length > 20) {
        console.warn('⚠️ Large roles array may be contributing to token size');
      }
    }
    if (payload.user && typeof payload.user === 'object') {
      const userSize = JSON.stringify(payload.user).length;
      console.log(`👤 User object size: ${userSize} characters`);
      if (userSize > 1000) {
        console.warn('⚠️ Large user object embedded in token - consider using user ID only');
      }
    }
    if (payload.resources && Array.isArray(payload.resources)) {
      console.log(`📋 Resources count: ${payload.resources.length}`);
      if (payload.resources.length > 20) {
        console.warn('⚠️ Large resources array may be contributing to token size');
      }
    }
  }
};

/**
 * Extracts the user ID from the JWT token
 */
export const getUserIdFromToken = (): string | null => {
  const token = getAccessToken();
  if (!token) return null;

  const payload = decodeJWT(token);
  return payload?.sub || payload?.userId || payload?.id || null;
};

// Make analysis function available globally for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { analyzeJWT: typeof analyzeToken }).analyzeJWT = analyzeToken;
  console.log('🔧 JWT Analysis Tool Available: Call analyzeJWT() in console to analyze current token');
}